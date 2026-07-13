// Package templates provides pre-configured service templates.
// Each template defines a Docker Compose configuration that users can deploy with one click.
package templates

import (
	"fmt"
	"sort"
	"sync"
)

// Category represents a group of templates.
type Category string

const (
	CategoryDatabases  Category = "databases"
	CategoryWebServers Category = "webservers"
	CategoryCMS        Category = "cms"
	CategoryDevTools   Category = "devtools"
	CategoryMonitoring Category = "monitoring"
	CategoryMedia      Category = "media"
	CategoryNetworking Category = "networking"
	CategoryAI         Category = "ai"
)

// Template represents a pre-configured service that can be deployed with one click.
type Template struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Icon        string   `json:"icon"`
	Category    Category `json:"category"`
	Image       string   `json:"image"`
	Ports       []string `json:"ports"`    // e.g. ["3000:3000", "5432:5432"]
	Volumes     []string `json:"volumes"`  // e.g. ["data:/var/lib/postgresql/data"]
	EnvVars     []string `json:"env_vars"` // e.g. ["POSTGRES_PASSWORD=changeme"]
	Command     string   `json:"command"`  // optional docker run command
	Version     string   `json:"version"`
	Website     string   `json:"website"`
	Difficulty  string   `json:"difficulty"` // easy, medium, hard
	Tags        []string `json:"tags"`
}

// Manager manages available service templates.
type Manager struct {
	mu        sync.RWMutex
	templates map[string]*Template
}

// NewManager creates a new template manager with all built-in templates.
func NewManager() *Manager {
	m := &Manager{templates: make(map[string]*Template)}
	m.loadBuiltins()
	return m
}

// Get returns a template by ID.
func (m *Manager) Get(id string) (*Template, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	t, ok := m.templates[id]
	return t, ok
}

// List returns all templates, optionally filtered by category.
func (m *Manager) List(category Category) []*Template {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []*Template
	for _, t := range m.templates {
		if category == "" || t.Category == category {
			result = append(result, t)
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	return result
}

// Categories returns all available categories with template counts.
func (m *Manager) Categories() map[string]int {
	m.mu.RLock()
	defer m.mu.RUnlock()

	counts := make(map[string]int)
	for _, t := range m.templates {
		counts[string(t.Category)]++
	}
	return counts
}

// Search searches templates by name, description, or tags.
func (m *Manager) Search(query string) []*Template {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []*Template
	q := toLower(query)

	for _, t := range m.templates {
		if contains(toLower(t.Name), q) ||
			contains(toLower(t.Description), q) ||
			contains(toLower(string(t.Category)), q) ||
			anyContains(t.Tags, q) {
			result = append(result, t)
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	return result
}

func (m *Manager) loadBuiltins() {
	// ── Databases ──
	m.add(&Template{
		ID: "postgres", Name: "PostgreSQL", Icon: "🐘",
		Description: "Advanced open-source relational database",
		Category:    CategoryDatabases, Image: "postgres:16-alpine",
		Ports: []string{"5432:5432"}, Volumes: []string{"pgdata:/var/lib/postgresql/data"},
		EnvVars: []string{"POSTGRES_PASSWORD=changeme", "POSTGRES_DB=app"},
		Version: "16", Website: "https://postgresql.org", Difficulty: "easy",
		Tags: []string{"sql", "relational", "acid"},
	})
	m.add(&Template{
		ID: "mysql", Name: "MySQL", Icon: "🐬",
		Description: "World's most popular open-source database",
		Category:    CategoryDatabases, Image: "mysql:8",
		Ports: []string{"3306:3306"}, Volumes: []string{"mysqldata:/var/lib/mysql"},
		EnvVars: []string{"MYSQL_ROOT_PASSWORD=changeme", "MYSQL_DATABASE=app"},
		Version: "8", Website: "https://mysql.com", Difficulty: "easy",
		Tags: []string{"sql", "relational", "popular"},
	})
	m.add(&Template{
		ID: "mariadb", Name: "MariaDB", Icon: "🦭",
		Description: "MySQL-compatible drop-in replacement",
		Category:    CategoryDatabases, Image: "mariadb:11",
		Ports: []string{"3306:3306"}, Volumes: []string{"mariadbdata:/var/lib/mysql"},
		EnvVars: []string{"MYSQL_ROOT_PASSWORD=changeme", "MYSQL_DATABASE=app"},
		Version: "11", Website: "https://mariadb.org", Difficulty: "easy",
		Tags: []string{"sql", "mysql-compatible"},
	})
	m.add(&Template{
		ID: "mongo", Name: "MongoDB", Icon: "🍃",
		Description: "Document-oriented NoSQL database",
		Category:    CategoryDatabases, Image: "mongo:7",
		Ports: []string{"27017:27017"}, Volumes: []string{"mongodata:/data/db"},
		EnvVars: []string{"MONGO_INITDB_ROOT_USERNAME=admin", "MONGO_INITDB_ROOT_PASSWORD=changeme"},
		Version: "7", Website: "https://mongodb.com", Difficulty: "easy",
		Tags: []string{"nosql", "document", "json"},
	})
	m.add(&Template{
		ID: "redis", Name: "Redis", Icon: "🔴",
		Description: "In-memory data store and cache",
		Category:    CategoryDatabases, Image: "redis:7-alpine",
		Ports: []string{"6379:6379"}, Volumes: []string{"redisdata:/data"},
		EnvVars: []string{"REDIS_PASSWORD=changeme"},
		Version: "7", Website: "https://redis.io", Difficulty: "easy",
		Tags: []string{"cache", "in-memory", "fast"},
	})
	m.add(&Template{
		ID: "valkey", Name: "Valkey", Icon: "⚡",
		Description: "High-performance Redis-compatible key-value store",
		Category:    CategoryDatabases, Image: "valkey/valkey:8-alpine",
		Ports: []string{"6379:6379"}, Volumes: []string{"valkeydata:/data"},
		EnvVars: []string{"VALKEY_PASSWORD=changeme"},
		Version: "8", Website: "https://valkey.io", Difficulty: "easy",
		Tags: []string{"cache", "redis-compatible", "fast"},
	})

	// ── Web Servers ──
	m.add(&Template{
		ID: "nginx", Name: "Nginx", Icon: "🌐",
		Description: "High-performance web server and reverse proxy",
		Category:    CategoryWebServers, Image: "nginx:alpine",
		Ports: []string{"80:80", "443:443"}, Volumes: []string{"html:/usr/share/nginx/html", "conf:/etc/nginx/conf.d"},
		Version: "latest", Website: "https://nginx.org", Difficulty: "easy",
		Tags: []string{"webserver", "reverse-proxy", "http"},
	})
	m.add(&Template{
		ID: "caddy", Name: "Caddy", Icon: "🔧",
		Description: "Web server with automatic HTTPS",
		Category:    CategoryWebServers, Image: "caddy:alpine",
		Ports: []string{"80:80", "443:443"}, Volumes: []string{"caddy_data:/data", "caddy_config:/config"},
		Version: "latest", Website: "https://caddyserver.com", Difficulty: "easy",
		Tags: []string{"webserver", "auto-https", "tls"},
	})
	m.add(&Template{
		ID: "traefik", Name: "Traefik", Icon: "🔀",
		Description: "Cloud-native reverse proxy with auto-discovery",
		Category:    CategoryWebServers, Image: "traefik:v3.1",
		Ports:   []string{"80:80", "8080:8080", "443:443"},
		Volumes: []string{"/var/run/docker.sock:/var/run/docker.sock:ro", "traefik_certs:/certs"},
		EnvVars: []string{"TRAEFIK_DOCKER=true"},
		Version: "3.1", Website: "https://traefik.io", Difficulty: "medium",
		Tags: []string{"reverse-proxy", "auto-discovery", "docker"},
	})
	m.add(&Template{
		ID: "caddy-lab", Name: "Caddy (Lab)", Icon: "🧪",
		Description: "Caddy for local development and testing",
		Category:    CategoryWebServers, Image: "caddy:alpine",
		Ports:   []string{"8080:80", "8443:443"},
		Volumes: []string{"caddy_data:/data", "caddy_config:/config"},
		Version: "latest", Website: "https://caddyserver.com", Difficulty: "easy",
		Tags: []string{"webserver", "development", "local"},
	})

	// ── CMS ──
	m.add(&Template{
		ID: "wordpress", Name: "WordPress", Icon: "📝",
		Description: "Most popular CMS in the world",
		Category:    CategoryCMS, Image: "wordpress:6-php8.3-fpm-alpine",
		Ports: []string{"8080:80"}, Volumes: []string{"wp_data:/var/www/html"},
		EnvVars: []string{"WORDPRESS_DB_HOST=mysql", "WORDPRESS_DB_USER=wp", "WORDPRESS_DB_PASSWORD=changeme", "WORDPRESS_DB_NAME=wordpress"},
		Version: "6", Website: "https://wordpress.org", Difficulty: "easy",
		Tags: []string{"cms", "blog", "php"},
	})
	m.add(&Template{
		ID: "ghost", Name: "Ghost", Icon: "👻",
		Description: "Professional publishing platform",
		Category:    CategoryCMS, Image: "ghost:5-alpine",
		Ports: []string{"2368:2368"}, Volumes: []string{"ghost_content:/var/lib/ghost/content"},
		EnvVars: []string{"url=http://localhost:2368", "database__client=sqlite"},
		Version: "5", Website: "https://ghost.org", Difficulty: "easy",
		Tags: []string{"cms", "blogging", "newsletter"},
	})
	m.add(&Template{
		ID: "drupal", Name: "Drupal", Icon: "💧",
		Description: "Enterprise-grade content management framework",
		Category:    CategoryCMS, Image: "drupal:10-php8.3-fpm-alpine",
		Ports: []string{"8080:80"}, Volumes: []string{"drupal_data:/var/www/html"},
		EnvVars: []string{"MYSQL_HOST=mysql", "MYSQL_USER=drupal", "MYSQL_PASSWORD=changeme", "MYSQL_DATABASE=drupal"},
		Version: "10", Website: "https://drupal.org", Difficulty: "medium",
		Tags: []string{"cms", "enterprise", "php"},
	})

	// ── Dev Tools ──
	m.add(&Template{
		ID: "gitea", Name: "Gitea", Icon: "🐱",
		Description: "Lightweight self-hosted Git service (GitHub alternative)",
		Category:    CategoryDevTools, Image: "gitea/gitea:1.22-rootless",
		Ports: []string{"3000:3000", "2222:2222"}, Volumes: []string{"gitea_data:/var/lib/gitea"},
		EnvVars: []string{"GITEA__database__DB_TYPE=sqlite3"},
		Version: "1.22", Website: "https://gitea.com", Difficulty: "easy",
		Tags: []string{"git", "github", "self-hosted"},
	})
	m.add(&Template{
		ID: "gitlab-ce", Name: "GitLab CE", Icon: "🦊",
		Description: "Complete DevOps platform (self-hosted GitLab)",
		Category:    CategoryDevTools, Image: "gitlab/gitlab-ce:latest",
		Ports: []string{"80:80", "443:443", "22:22"}, Volumes: []string{"gitlab_config:/etc/gitlab", "gitlab_logs:/var/log/gitlab", "gitlab_data:/var/opt/gitlab"},
		EnvVars: []string{"GITLAB_OMNIBUS_CONFIG=external_url 'http://localhost'"},
		Version: "latest", Website: "https://gitlab.com", Difficulty: "hard",
		Tags: []string{"git", "ci-cd", "devops", "heavy"},
	})
	m.add(&Template{
		ID: "code-server", Name: "VS Code Server", Icon: "💻",
		Description: "VS Code in the browser (web IDE)",
		Category:    CategoryDevTools, Image: "lscr.io/linuxserver/code-server:latest",
		Ports: []string{"8443:8443"}, Volumes: []string{"vscode_config:/config", "/home:/home"},
		EnvVars: []string{"PASSWORD=changeme", "SUDO_PASSWORD=changeme"},
		Version: "latest", Website: "https://github.com/coder/code-server", Difficulty: "easy",
		Tags: []string{"ide", "code", "editor", "web"},
	})
	m.add(&Template{
		ID: "portainer", Name: "Portainer CE", Icon: "🐳",
		Description: "Docker management UI",
		Category:    CategoryDevTools, Image: "portainer/portainer-ce:latest",
		Ports: []string{"9443:9443"}, Volumes: []string{"/var/run/docker.sock:/var/run/docker.sock", "portainer_data:/data"},
		Version: "latest", Website: "https://portainer.io", Difficulty: "easy",
		Tags: []string{"docker", "container-management", "ui"},
	})
	m.add(&Template{
		ID: "pgadmin", Name: "pgAdmin 4", Icon: "🐘",
		Description: "PostgreSQL admin and management tool",
		Category:    CategoryDevTools, Image: "dpage/pgadmin4:latest",
		Ports: []string{"5050:80"}, Volumes: []string{"pgadmin_data:/var/lib/pgadmin"},
		EnvVars: []string{"PGADMIN_DEFAULT_EMAIL=admin@admin.com", "PGADMIN_DEFAULT_PASSWORD=changeme"},
		Version: "latest", Website: "https://pgadmin.org", Difficulty: "easy",
		Tags: []string{"postgresql", "admin", "database-gui"},
	})

	// ── Monitoring ──
	m.add(&Template{
		ID: "grafana", Name: "Grafana", Icon: "📊",
		Description: "Observability and visualization platform",
		Category:    CategoryMonitoring, Image: "grafana/grafana:latest",
		Ports: []string{"3000:3000"}, Volumes: []string{"grafana_data:/var/lib/grafana"},
		EnvVars: []string{"GF_SECURITY_ADMIN_PASSWORD=changeme"},
		Version: "latest", Website: "https://grafana.com", Difficulty: "easy",
		Tags: []string{"dashboards", "visualization", "monitoring"},
	})
	m.add(&Template{
		ID: "prometheus", Name: "Prometheus", Icon: "🔥",
		Description: "Metrics collection and alerting",
		Category:    CategoryMonitoring, Image: "prom/prometheus:latest",
		Ports: []string{"9090:9090"}, Volumes: []string{"prometheus_data:/prometheus"},
		Version: "latest", Website: "https://prometheus.io", Difficulty: "medium",
		Tags: []string{"metrics", "alerting", "tsdb"},
	})
	m.add(&Template{
		ID: "uptime-kuma", Name: "Uptime Kuma", Icon: "💚",
		Description: "Self-hosted uptime monitoring",
		Category:    CategoryMonitoring, Image: "louislam/uptime-kuma:latest",
		Ports: []string{"3001:3001"}, Volumes: []string{"uptime_data:/app/data"},
		Version: "latest", Website: "https://github.com/louislam/uptime-kuma", Difficulty: "easy",
		Tags: []string{"uptime", "monitoring", "status-page"},
	})
	m.add(&Template{
		ID: "dozzle", Name: "Dozzle", Icon: "📋",
		Description: "Real-time Docker log viewer",
		Category:    CategoryMonitoring, Image: "amir20/dozzle:latest",
		Ports:   []string{"9999:8080"},
		Volumes: []string{"/var/run/docker.sock:/var/run/docker.sock:ro"},
		Version: "latest", Website: "https://dozzle.dev", Difficulty: "easy",
		Tags: []string{"logs", "docker", "real-time"},
	})

	// ── Media ──
	m.add(&Template{
		ID: "jellyfin", Name: "Jellyfin", Icon: "🎬",
		Description: "Free and open media server (Plex alternative)",
		Category:    CategoryMedia, Image: "jellyfin/jellyfin:latest",
		Ports: []string{"8096:8096"}, Volumes: []string{"jellyfin_config:/config", "jellyfin_cache:/cache", "/media:/media"},
		Version: "latest", Website: "https://jellyfin.org", Difficulty: "easy",
		Tags: []string{"media", "streaming", "plex-alternative"},
	})
	m.add(&Template{
		ID: "nextcloud", Name: "Nextcloud", Icon: "☁️",
		Description: "Self-hosted cloud storage and productivity",
		Category:    CategoryMedia, Image: "nextcloud:latest",
		Ports: []string{"8080:80"}, Volumes: []string{"nextcloud_data:/var/www/html"},
		EnvVars: []string{"SQLITE_DATABASE=nextcloud", "NEXTCLOUD_ADMIN_USER=admin", "NEXTCLOUD_ADMIN_PASSWORD=changeme"},
		Version: "latest", Website: "https://nextcloud.com", Difficulty: "easy",
		Tags: []string{"cloud", "files", "sync", "dropbox-alternative"},
	})
	m.add(&Template{
		ID: "vaultwarden", Name: "Vaultwarden", Icon: "🔐",
		Description: "Lightweight Bitwarden-compatible password manager",
		Category:    CategoryMedia, Image: "vaultwarden/server:latest",
		Ports: []string{"8222:80"}, Volumes: []string{"vw_data:/data"},
		EnvVars: []string{"SIGNUPS_ALLOWED=true", "ADMIN_TOKEN=changeme"},
		Version: "latest", Website: "https://github.com/dani-garcia/vaultwarden", Difficulty: "easy",
		Tags: []string{"passwords", "security", "bitwarden"},
	})
	m.add(&Template{
		ID: "immich", Name: "Immich", Icon: "📸",
		Description: "Self-hosted photo and video management (Google Photos alternative)",
		Category:    CategoryMedia, Image: "ghcr.io/immich-app/immich-server:release",
		Ports: []string{"2283:2283"}, Volumes: []string{"immich_data:/usr/src/app/upload"},
		EnvVars: []string{"DB_PASSWORD=changeme", "JWT_SECRET=changeme"},
		Version: "latest", Website: "https://immich.app", Difficulty: "medium",
		Tags: []string{"photos", "backup", "google-photos-alternative"},
	})

	// ── Networking ──
	m.add(&Template{
		ID: "wireguard", Name: "WireGuard VPN", Icon: "🔒",
		Description: "Fast, modern VPN tunnel",
		Category:    CategoryNetworking, Image: "linuxserver/wireguard:latest",
		Ports: []string{"51820:51820/udp"}, Volumes: []string{"wg_config:/config"},
		EnvVars: []string{"SERVERURL=auto", "PEERS=5"},
		Version: "latest", Website: "https://wireguard.com", Difficulty: "medium",
		Tags: []string{"vpn", "tunnel", "security"},
	})
	m.add(&Template{
		ID: "pihole", Name: "Pi-hole", Icon: "🛡️",
		Description: "Network-wide ad blocker and DNS sinkhole",
		Category:    CategoryNetworking, Image: "pihole/pihole:latest",
		Ports: []string{"53:53/tcp", "53:53/udp", "8053:80/tcp"}, Volumes: []string{"pihole_data:/etc/pihole", "dnsmasq:/etc/dnsmasq.d"},
		EnvVars: []string{"TZ=UTC", "WEBPASSWORD=changeme"},
		Version: "latest", Website: "https://pi-hole.net", Difficulty: "easy",
		Tags: []string{"dns", "ad-blocker", "privacy"},
	})
	m.add(&Template{
		ID: "adguard", Name: "AdGuard Home", Icon: "🏠",
		Description: "Network-wide ad and tracker blocking DNS server",
		Category:    CategoryNetworking, Image: "adguard/adguardhome:latest",
		Ports: []string{"53:53/tcp", "53:53/udp", "3000:3000"}, Volumes: []string{"adguard_work:/opt/adguardhome/work", "adguard_conf:/opt/adguardhome/conf"},
		Version: "latest", Website: "https://adguard.com", Difficulty: "easy",
		Tags: []string{"dns", "ad-blocker", "privacy", "pihole-alternative"},
	})
	m.add(&Template{
		ID: "crowdsec", Name: "CrowdSec", Icon: "👮",
		Description: "Collaborative security engine and IPS",
		Category:    CategoryNetworking, Image: "crowdsec/crowdsec:latest",
		Ports:   []string{"6060:6060"},
		Volumes: []string{"/var/run/docker.sock:/var/run/docker.sock:ro", "crowdsec_data:/var/lib/crowdsec/data"},
		EnvVars: []string{"GID=1000", " COLLECTIONS=crowdsecurity/linux"},
		Version: "latest", Website: "https://crowdsec.net", Difficulty: "hard",
		Tags: []string{"security", "ips", "firewall"},
	})

	// ── AI / LLM ──
	m.add(&Template{
		ID: "ollama", Name: "Ollama", Icon: "🦙",
		Description: "Run open-source LLMs locally (Llama, Mistral, etc.)",
		Category:    CategoryAI, Image: "ollama/ollama:latest",
		Ports: []string{"11434:11434"}, Volumes: []string{"ollama_data:/root/.ollama"},
		Version: "latest", Website: "https://ollama.com", Difficulty: "easy",
		Tags: []string{"llm", "ai", "inference", "local"},
	})
	m.add(&Template{
		ID: "openwebui", Name: "Open WebUI", Icon: "🤖",
		Description: "ChatGPT-like interface for local LLMs",
		Category:    CategoryAI, Image: "ghcr.io/open-webui/open-webui:main",
		Ports: []string{"3000:8080"}, Volumes: []string{"openwebui_data:/app/backend/data"},
		EnvVars: []string{"OLLAMA_BASE_URL=http://host.docker.internal:11434"},
		Version: "latest", Website: "https://openwebui.com", Difficulty: "easy",
		Tags: []string{"chat", "ui", "llm", "openai-alternative"},
	})
	m.add(&Template{
		ID: "n8n", Name: "n8n", Icon: "⚡",
		Description: "Workflow automation (Zapier alternative)",
		Category:    CategoryAI, Image: "n8nio/n8n:latest",
		Ports: []string{"5678:5678"}, Volumes: []string{"n8n_data:/home/node/.n8n"},
		EnvVars: []string{"N8N_SECURE_COOKIE=false"},
		Version: "latest", Website: "https://n8n.io", Difficulty: "easy",
		Tags: []string{"automation", "workflows", "zapier-alternative"},
	})
	m.add(&Template{
		ID: "dify", Name: "Dify", Icon: "🧠",
		Description: "LLM application development platform",
		Category:    CategoryAI, Image: "langgenius/dify:latest",
		Ports: []string{"8080:80"}, Volumes: []string{"dify_data:/app/data"},
		EnvVars: []string{"SECRET_KEY=changeme", "DB_USERNAME=postgres", "DB_PASSWORD=changeme"},
		Version: "latest", Website: "https://dify.ai", Difficulty: "hard",
		Tags: []string{"llm", "platform", "rag", "agents"},
	})
	m.add(&Template{
		ID: "langflow", Name: "Langflow", Icon: "🌊",
		Description: "Visual LLM workflow builder",
		Category:    CategoryAI, Image: "langflowai/langflow:latest",
		Ports: []string{"7860:7860"}, Volumes: []string{"langflow_data:/app/data"},
		Version: "latest", Website: "https://langflow.org", Difficulty: "medium",
		Tags: []string{"llm", "visual", "workflow", "rag"},
	})
}

func (m *Manager) add(t *Template) {
	m.templates[t.ID] = t
}

func toLower(s string) string {
	result := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			c += 32
		}
		result[i] = c
	}
	return string(result)
}

func contains(s, substr string) bool {
	return len(substr) == 0 || fmt.Sprintf("%s", s) != s && len(s) >= len(substr) && (s == substr || len(s) > 0 && containsSubstr(s, substr))
}

func containsSubstr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func anyContains(tags []string, q string) bool {
	for _, t := range tags {
		if contains(toLower(t), q) {
			return true
		}
	}
	return false
}
