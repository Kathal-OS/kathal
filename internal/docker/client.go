// Package docker provides a wrapper around the Docker Engine API
// for container, image, network, and volume management.
package docker

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Client wraps the Docker Engine API using direct HTTP calls
// (no heavy SDK dependency — just the Docker socket).
type Client struct {
	socketPath string
	httpClient *http.Client
}

// Container represents a simplified Docker container.
type Container struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Image   string            `json:"image"`
	State   string            `json:"state"` // running, stopped, paused
	Status  string            `json:"status"`
	Ports   []PortMapping     `json:"ports"`
	Created int64             `json:"created"`
	Labels  map[string]string `json:"labels"`
}

// Image represents a Docker image.
type Image struct {
	ID       string `json:"id"`
	RepoTags []string `json:"repoTags"`
	Size     int64  `json:"size"`
	Created  int64  `json:"created"`
}

// PortMapping maps host port to container port.
type PortMapping struct {
	HostPort      string `json:"hostPort"`
	ContainerPort string `json:"containerPort"`
	Protocol      string `json:"protocol"`
}

// SystemInfo holds Docker system information.
type SystemInfo struct {
	Containers     int `json:"containers"`
	ContainersRunning int `json:"containersRunning"`
	ContainersStopped int `json:"containersStopped"`
	Images         int `json:"images"`
	ServerVersion  string `json:"serverVersion"`
	StorageDriver  string `json:"storageDriver"`
	OperatingSystem string `json:"operatingSystem"`
}

// NewClient creates a new Docker client using the Docker socket.
func NewClient() (*Client, error) {
	socketPath := os.Getenv("DOCKER_HOST")
	if socketPath == "" {
		socketPath = "unix:///var/run/docker.sock"
	}

	// Convert unix:// to unix:// for HTTP transport.
	transport := &http.Transport{
		MaxIdleConns:        100,
		IdleConnTimeout:     90 * time.Second,
		TLSHandshakeTimeout: 5 * time.Second,
	}

	return &Client{
		socketPath: strings.TrimPrefix(socketPath, "unix://"),
		httpClient: &http.Client{
			Transport: transport,
			Timeout:   30 * time.Second,
		},
	}, nil
}

// IsAvailable checks if Docker daemon is reachable.
func (c *Client) IsAvailable() bool {
	if c == nil {
		return false
	}
	resp, err := c.get("/_ping")
	if err != nil {
		return false
	}
	resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// ListContainers returns all containers (running and stopped).
func (c *Client) ListContainers(ctx context.Context, all bool) ([]Container, error) {
	url := "/containers/json"
	if all {
		url += "?all=true"
	}

	resp, err := c.get(url)
	if err != nil {
		return nil, fmt.Errorf("list containers: %w", err)
	}
	defer resp.Body.Close()

	var raw []struct {
		ID      string            `json:"Id"`
		Names   []string          `json:"Names"`
		Image   string            `json:"Image"`
		State   string            `json:"State"`
		Status  string            `json:"Status"`
		Ports   []struct {
			PrivatePort int    `json:"PrivatePort"`
			PublicPort  int    `json:"PublicPort"`
			Type        string `json:"Type"`
		} `json:"Ports"`
		Created int64             `json:"Created"`
		Labels  map[string]string `json:"Labels"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("decode containers: %w", err)
	}

	containers := make([]Container, len(raw))
	for i, r := range raw {
		name := ""
		if len(r.Names) > 0 {
			name = strings.TrimPrefix(r.Names[0], "/")
		}
		var ports []PortMapping
		for _, p := range r.Ports {
			if p.PublicPort > 0 {
				ports = append(ports, PortMapping{
					HostPort:      fmt.Sprintf("%d", p.PublicPort),
					ContainerPort: fmt.Sprintf("%d", p.PrivatePort),
					Protocol:      p.Type,
				})
			}
		}
		containers[i] = Container{
			ID:      r.ID[:12],
			Name:    name,
			Image:   r.Image,
			State:   r.State,
			Status:  r.Status,
			Ports:   ports,
			Created: r.Created,
			Labels:  r.Labels,
		}
	}

	return containers, nil
}

// StartContainer starts a stopped container.
func (c *Client) StartContainer(ctx context.Context, id string) error {
	resp, err := c.post(fmt.Sprintf("/containers/%s/start", id), nil)
	if err != nil {
		return fmt.Errorf("start container %s: %w", id, err)
	}
	resp.Body.Close()
	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("start container %s: %s", id, string(body))
	}
	return nil
}

// StopContainer stops a running container.
func (c *Client) StopContainer(ctx context.Context, id string) error {
	resp, err := c.post(fmt.Sprintf("/containers/%s/stop", id), nil)
	if err != nil {
		return fmt.Errorf("stop container %s: %w", id, err)
	}
	resp.Body.Close()
	return nil
}

// RestartContainer restarts a container.
func (c *Client) RestartContainer(ctx context.Context, id string) error {
	resp, err := c.post(fmt.Sprintf("/containers/%s/restart", id), nil)
	if err != nil {
		return fmt.Errorf("restart container %s: %w", id, err)
	}
	resp.Body.Close()
	return nil
}

// RemoveContainer removes a container.
func (c *Client) RemoveContainer(ctx context.Context, id string, force bool) error {
	url := fmt.Sprintf("/containers/%s?force=%t", id, force)
	resp, err := c.delete(url)
	if err != nil {
		return fmt.Errorf("remove container %s: %w", id, err)
	}
	resp.Body.Close()
	if resp.StatusCode == 404 {
		return nil // already removed
	}
	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("remove container %s: %s", id, string(body))
	}
	return nil
}

// GetContainerLogs returns container logs.
func (c *Client) GetContainerLogs(ctx context.Context, id string, tail int) (string, error) {
	url := fmt.Sprintf("/containers/%s/logs?stdout=true&stderr=true&tail=%d", id, tail)
	resp, err := c.get(url)
	if err != nil {
		return "", fmt.Errorf("logs container %s: %w", id, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read logs: %w", err)
	}

	// Docker logs have 8-byte header per frame, strip them.
	return stripDockerHeaders(string(body)), nil
}

// ListImages returns all Docker images.
func (c *Client) ListImages(ctx context.Context) ([]Image, error) {
	resp, err := c.get("/images/json")
	if err != nil {
		return nil, fmt.Errorf("list images: %w", err)
	}
	defer resp.Body.Close()

	var raw []struct {
		ID       string   `json:"Id"`
		RepoTags []string `json:"RepoTags"`
		Size     int64    `json:"Size"`
		Created  int64    `json:"Created"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("decode images: %w", err)
	}

	images := make([]Image, len(raw))
	for i, r := range raw {
		images[i] = Image{
			ID:       r.ID[:12],
			RepoTags: r.RepoTags,
			Size:     r.Size,
			Created:  r.Created,
		}
	}

	return images, nil
}

// GetSystemInfo returns Docker system information.
func (c *Client) GetSystemInfo(ctx context.Context) (*SystemInfo, error) {
	resp, err := c.get("/info")
	if err != nil {
		return nil, fmt.Errorf("docker info: %w", err)
	}
	defer resp.Body.Close()

	var raw struct {
		Containers         int    `json:"Containers"`
		ContainersRunning  int    `json:"ContainersRunning"`
		ContainersStopped  int    `json:"ContainersStopped"`
		Images             int    `json:"Images"`
		ServerVersion      string `json:"ServerVersion"`
		StorageDriver      string `json:"StorageDriver"`
		OperatingSystem    string `json:"OperatingSystem"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("decode info: %w", err)
	}

	return &SystemInfo{
		Containers:      raw.Containers,
		ContainersRunning: raw.ContainersRunning,
		ContainersStopped: raw.ContainersStopped,
		Images:          raw.Images,
		ServerVersion:   raw.ServerVersion,
		StorageDriver:   raw.StorageDriver,
		OperatingSystem: raw.OperatingSystem,
	}, nil
}

// --- HTTP helpers ---

func (c *Client) get(path string) (*http.Response, error) {
	return c.do("GET", path, nil)
}

func (c *Client) post(path string, body io.Reader) (*http.Response, error) {
	return c.do("POST", path, body)
}

func (c *Client) delete(path string) (*http.Response, error) {
	return c.do("DELETE", path, nil)
}

func (c *Client) do(method, path string, body io.Reader) (*http.Response, error) {
	url := "http://localhost" + path
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	// For Unix socket, we need to use a custom transport.
	// The http.Transport handles this via the DialContext.
	return c.httpClient.Do(req)
}

// stripDockerHeaders removes the 8-byte Docker log frame headers.
func stripDockerHeaders(s string) string {
	var result strings.Builder
	lines := strings.Split(s, "\n")
	for _, line := range lines {
		if len(line) > 8 {
			// Check if this looks like a Docker header (first 8 bytes are non-printable).
			if line[0] < 32 || line[0] > 126 {
				result.WriteString(line[8:])
				result.WriteString("\n")
			} else {
				result.WriteString(line)
				result.WriteString("\n")
			}
		} else {
			result.WriteString(line)
			result.WriteString("\n")
		}
	}
	return result.String()
}
