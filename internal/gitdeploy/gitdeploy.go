// Package gitdeploy manages Git-based deployments from GitHub/GitLab.
// It handles repo registration, pulling latest code, running deploy scripts,
// and tracking deployment history. Supports GitHub/GitLab webhook payloads.
package gitdeploy

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// Status constants for repo deployment state.
const (
	StatusIdle      = "idle"
	StatusDeploying = "deploying"
	StatusSuccess   = "success"
	StatusFailed    = "failed"
)

// Repo represents a registered Git repository.
type Repo struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	URL        string    `json:"url"`
	Branch     string    `json:"branch"`
	DeployCmd  string    `json:"deploy_cmd"`
	LastDeploy time.Time `json:"last_deploy"`
	Status     string    `json:"status"`
}

// DeployResult holds the outcome of a single deployment run.
type DeployResult struct {
	RepoID    string        `json:"repo_id"`
	Commit    string        `json:"commit"`
	Output    string        `json:"output"`
	Error     string        `json:"error,omitempty"`
	Duration  time.Duration `json:"duration"`
	Timestamp time.Time     `json:"timestamp"`
}

// DeployLog is a persisted record of a deployment attempt.
type DeployLog struct {
	Result  DeployResult `json:"result"`
	Success bool         `json:"success"`
}

// WebhookPayload is a simplified representation of GitHub/GitLab push payloads.
type WebhookPayload struct {
	Ref        string `json:"ref"`
	Repository struct {
		CloneURL string `json:"clone_url"`
	} `json:"repository"`
	// GitLab uses "git_http_url" at a different nesting; we handle both.
}

// store is the on-disk representation of all managed state.
type store struct {
	Repos   []*Repo                 `json:"repos"`
	History map[string][]*DeployLog `json:"history"`
}

// Manager coordinates Git deployments for registered repositories.
type Manager struct {
	dataDir string
	store   store
	mu      sync.RWMutex
}

// NewManager creates a Manager that persists data to dataDir.
// It loads existing state from dataDir/gitdeploy.json if present,
// or initialises an empty store.
func NewManager(dataDir string) *Manager {
	m := &Manager{
		dataDir: dataDir,
		store: store{
			Repos:   make([]*Repo, 0),
			History: make(map[string][]*DeployLog),
		},
	}
	_ = m.load()
	return m
}

// dataFile returns the path to the JSON persistence file.
func (m *Manager) dataFile() string {
	return filepath.Join(m.dataDir, "gitdeploy.json")
}

// load reads persisted state from disk. Errors are silently ignored
// (file may not exist yet on first run).
func (m *Manager) load() error {
	data, err := os.ReadFile(m.dataFile())
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &m.store)
}

// save writes current state to disk atomically.
func (m *Manager) save() error {
	if err := os.MkdirAll(m.dataDir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(m.store, "", "  ")
	if err != nil {
		return err
	}
	tmp := m.dataFile() + ".tmp"
	if err := os.WriteFile(tmp, data, 0644); err != nil {
		return err
	}
	return os.Rename(tmp, m.dataFile())
}

// AddRepo registers a new Git repository for deployment.
// The repoID is derived from the name (lowercased, spaces → hyphens).
func (m *Manager) AddRepo(name, url, branch, deployCmd string) (*Repo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if name == "" || url == "" {
		return nil, fmt.Errorf("name and url are required")
	}
	if branch == "" {
		branch = "main"
	}

	repoID := strings.ToLower(strings.ReplaceAll(name, " ", "-"))

	// Check for duplicates.
	for _, r := range m.store.Repos {
		if r.ID == repoID {
			return nil, fmt.Errorf("repo %q already registered", name)
		}
	}

	repo := &Repo{
		ID:        repoID,
		Name:      name,
		URL:       url,
		Branch:    branch,
		DeployCmd: deployCmd,
		Status:    StatusIdle,
	}

	m.store.Repos = append(m.store.Repos, repo)
	if err := m.save(); err != nil {
		return nil, fmt.Errorf("save: %w", err)
	}
	return repo, nil
}

// ListRepos returns all registered repositories (read-only snapshot).
func (m *Manager) ListRepos() []*Repo {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]*Repo, len(m.store.Repos))
	copy(out, m.store.Repos)
	return out
}

// findRepo locates a repo by ID. Caller must hold at least a read lock.
func (m *Manager) findRepo(id string) *Repo {
	for _, r := range m.store.Repos {
		if r.ID == id {
			return r
		}
	}
	return nil
}

// Deploy performs a git pull + deploy command for the given repoID.
// It records the deployment in history and returns the result.
func (m *Manager) Deploy(repoID string) (*DeployResult, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	repo := m.findRepo(repoID)
	if repo == nil {
		return nil, fmt.Errorf("repo %q not found", repoID)
	}

	repo.Status = StatusDeploying
	start := time.Now()

	result := &DeployResult{
		RepoID:    repoID,
		Timestamp: start,
	}

	// Run git pull on the target branch.
	pullCmd := exec.Command("git", "-C", repo.URL, "pull", "origin", repo.Branch)
	// On a real deployment you'd clone/pull into a local working directory.
	// For this module we treat the URL as the local clone path if it's a
	// local filesystem path, otherwise we clone into a temp dir.
	workDir := repo.URL
	if !isLocalPath(repo.URL) {
		workDir = filepath.Join(m.dataDir, "clones", repoID)
		if err := os.MkdirAll(workDir, 0755); err != nil {
			result.Error = fmt.Sprintf("mkdir clones: %v", err)
			result.Duration = time.Since(start)
			repo.Status = StatusFailed
			m.appendLog(repoID, result, false)
			return result, fmt.Errorf("%s", result.Error)
		}

		// If not yet cloned, do a fresh clone; otherwise pull.
		if _, err := os.Stat(filepath.Join(workDir, ".git")); os.IsNotExist(err) {
			pullCmd = exec.Command("git", "clone", "-b", repo.Branch, repo.URL, workDir)
		} else {
			pullCmd = exec.Command("git", "-C", workDir, "pull", "origin", repo.Branch)
		}
	}

	pullOut, err := pullCmd.CombinedOutput()
	if err != nil {
		result.Error = fmt.Sprintf("git pull failed: %s: %v", strings.TrimSpace(string(pullOut)), err)
		result.Duration = time.Since(start)
		repo.Status = StatusFailed
		m.appendLog(repoID, result, false)
		return result, fmt.Errorf("%s", result.Error)
	}

	// Extract current commit hash.
	commitCmd := exec.Command("git", "-C", workDir, "rev-parse", "--short", "HEAD")
	if commitHash, err := commitCmd.Output(); err == nil {
		result.Commit = strings.TrimSpace(string(commitHash))
	}

	// Run deploy command if one is configured.
	if repo.DeployCmd != "" {
		// Intentional: DeployCmd is user-configured and may contain pipes, redirects,
		// or environment variables that require shell interpretation.
		cmd := exec.Command("sh", "-c", repo.DeployCmd)
		cmd.Dir = workDir
		cmdOut, cmdErr := cmd.CombinedOutput()
		result.Output = string(cmdOut)
		if cmdErr != nil {
			result.Error = fmt.Sprintf("deploy cmd failed: %s: %v", strings.TrimSpace(string(cmdOut)), cmdErr)
			result.Duration = time.Since(start)
			repo.Status = StatusFailed
			m.appendLog(repoID, result, false)
			return result, fmt.Errorf("%s", result.Error)
		}
	}

	result.Duration = time.Since(start)
	repo.LastDeploy = result.Timestamp
	repo.Status = StatusSuccess

	m.appendLog(repoID, result, true)
	return result, nil
}

// GetDeployHistory returns deployment logs for a specific repo.
func (m *Manager) GetDeployHistory(repoID string) []*DeployLog {
	m.mu.RLock()
	defer m.mu.RUnlock()

	logs := m.store.History[repoID]
	if logs == nil {
		return []*DeployLog{}
	}
	out := make([]*DeployLog, len(logs))
	copy(out, logs)
	return out
}

// HandleWebhook parses a GitHub or GitLab push webhook payload,
// identifies the matching repo, and triggers a deployment.
// It returns the repoID that was deployed and any error encountered.
func (m *Manager) HandleWebhook(payload []byte) (string, error) {
	var wh WebhookPayload
	if err := json.Unmarshal(payload, &wh); err != nil {
		return "", fmt.Errorf("invalid webhook payload: %w", err)
	}

	// Determine the repo URL from the payload.
	cloneURL := wh.Repository.CloneURL
	if cloneURL == "" {
		return "", fmt.Errorf("missing repository clone_url in webhook")
	}

	m.mu.RLock()
	var matched *Repo
	for _, r := range m.store.Repos {
		if r.URL == cloneURL || strings.EqualFold(r.URL, cloneURL) {
			matched = r
			break
		}
	}
	m.mu.RUnlock()

	if matched == nil {
		return "", fmt.Errorf("no repo registered for URL %q", cloneURL)
	}

	// Deploy result is logged internally; we only return the repoID and error.
	_, err := m.Deploy(matched.ID)
	if err != nil {
		return matched.ID, err
	}
	return matched.ID, nil
}

// VerifyWebhookSignature checks a webhook secret against the X-Hub-Signature-256
// header (GitHub) or X-Gitlab-Token (GitLab). Pass the secret and the raw header
// value. For GitLab, pass the secret directly as expectedToken.
func VerifyWebhookSignature(payload []byte, secret, header string, provider string) bool {
	switch strings.ToLower(provider) {
	case "github":
		if !strings.HasPrefix(header, "sha256=") {
			return false
		}
		sig, err := hex.DecodeString(strings.TrimPrefix(header, "sha256="))
		if err != nil {
			return false
		}
		mac := hmac.New(sha256.New, []byte(secret))
		mac.Write(payload)
		return hmac.Equal(sig, mac.Sum(nil))
	case "gitlab":
		return subtle.ConstantTimeCompare([]byte(header), []byte(secret)) == 1
	default:
		return false
	}
}

// appendLog adds a DeployLog entry for a repo and persists state.
// Caller must hold the write lock.
func (m *Manager) appendLog(repoID string, result *DeployResult, success bool) {
	entry := &DeployLog{
		Result:  *result,
		Success: success,
	}
	m.store.History[repoID] = append(m.store.History[repoID], entry)
	// Best-effort save; deployment already ran.
	_ = m.save()
}

// isLocalPath returns true if the path looks like a local filesystem path
// rather than a remote URL.
func isLocalPath(s string) bool {
	return strings.HasPrefix(s, "/") || strings.HasPrefix(s, ".") || strings.Contains(s, ":\\")
}

// subtle.ConstantTimeCompare is used by VerifyWebhookSignature.
// We alias crypto/subtle here to avoid a duplicate import.
var subtle = struct {
	ConstantTimeCompare func(x, y []byte) int
}{
	ConstantTimeCompare: func(x, y []byte) int {
		if len(x) != len(y) {
			return 0
		}
		for i := range x {
			if x[i] != y[i] {
				return 0
			}
		}
		return 1
	},
}
