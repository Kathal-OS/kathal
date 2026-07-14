// Package provider provides the Monitoring Provider Interface for KATHAL OS
// All monitoring backends (Beszel, Prometheus, Grafana, etc.) implement this interface.
package provider

import (
	"context"
	"time"
)

// MonitoringProvider defines the interface that all monitoring backends must implement
type MonitoringProvider interface {
	// Initialize initializes the provider with configuration
	Initialize(ctx context.Context, config ProviderConfig) error

	// Discover discovers available monitoring infrastructure
	Discover(ctx context.Context) (*DiscoveryResult, error)

	// Connect establishes connection to the monitoring backend
	Connect(ctx context.Context) error

	// Disconnect closes the connection
	Disconnect(ctx context.Context) error

	// Status returns the current status of the provider
	Status(ctx context.Context) (*ProviderStatus, error)

	// Health performs a health check
	Health(ctx context.Context) (*HealthResult, error)

	// Metrics returns current metrics
	Metrics(ctx context.Context, opts MetricsOptions) (*MetricsResult, error)

	// Alerts returns active alerts
	Alerts(ctx context.Context, opts AlertOptions) (*AlertsResult, error)

	// History returns historical metrics
	History(ctx context.Context, opts HistoryOptions) (*HistoryResult, error)

	// Nodes returns monitored nodes
	Nodes(ctx context.Context) (*NodesResult, error)

	// Containers returns container metrics
	Containers(ctx context.Context, opts ContainerOptions) (*ContainersResult, error)

	// Processes returns process metrics
	Processes(ctx context.Context, opts ProcessOptions) (*ProcessesResult, error)

	// Storage returns storage metrics
	Storage(ctx context.Context) (*StorageResult, error)

	// Networks returns network metrics
	Networks(ctx context.Context) (*NetworksResult, error)

	// Volumes returns volume metrics
	Volumes(ctx context.Context) (*VolumesResult, error)

	// Logs returns system logs
	Logs(ctx context.Context, opts LogOptions) (*LogsResult, error)

	// Events returns system events
	Events(ctx context.Context, opts EventOptions) (*EventsResult, error)

	// Backup creates a backup of monitoring data
	Backup(ctx context.Context, opts BackupOptions) (*BackupResult, error)

	// Restore restores monitoring data from backup
	Restore(ctx context.Context, opts RestoreOptions) (*RestoreResult, error)

	// Upgrade upgrades the monitoring backend
	Upgrade(ctx context.Context, opts UpgradeOptions) (*UpgradeResult, error)

	// Repair attempts to repair the monitoring backend
	Repair(ctx context.Context, opts RepairOptions) (*RepairResult, error)

	// Shutdown gracefully shuts down the provider
	Shutdown(ctx context.Context) error

	// GetCapabilities returns provider capabilities
	GetCapabilities() ProviderCapabilities

	// GetProviderInfo returns provider metadata
	GetProviderInfo() ProviderInfo
}

// ProviderConfig holds provider configuration
type ProviderConfig struct {
	ProviderID  string                 `json:"provider_id"`
	Name        string                 `json:"name"`
	Endpoint    string                 `json:"endpoint"`
	Username    string                 `json:"username,omitempty"`
	Password    string                 `json:"password,omitempty"`
	Token       string                 `json:"token,omitempty"`
	CertPath    string                 `json:"cert_path,omitempty"`
	KeyPath     string                 `json:"key_path,omitempty"`
	CAPath      string                 `json:"ca_path,omitempty"`
	InsecureTLS bool                   `json:"insecure_tls,omitempty"`
	Timeout     time.Duration          `json:"timeout,omitempty"`
	ExtraConfig map[string]interface{} `json:"extra_config,omitempty"`
}

// ProviderCapabilities describes what a provider can do
type ProviderCapabilities struct {
	Metrics             bool `json:"metrics"`
	RealtimeMonitoring  bool `json:"realtime_monitoring"`
	ContainerMonitoring bool `json:"container_monitoring"`
	Alerts              bool `json:"alerts"`
	History             bool `json:"history"`
	Health              bool `json:"health"`
	Docker              bool `json:"docker"`
	Podman              bool `json:"podman"`
	ClusterMonitoring   bool `json:"cluster_monitoring"`
	DatabaseMonitoring  bool `json:"database_monitoring"`
	ProcessMonitoring   bool `json:"process_monitoring"`
	StorageMonitoring   bool `json:"storage_monitoring"`
	NetworkMonitoring   bool `json:"network_monitoring"`
	VolumeMonitoring    bool `json:"volume_monitoring"`
	GPUMonitoring       bool `json:"gpu_monitoring"`
	CustomMetrics       bool `json:"custom_metrics"`
	Webhooks            bool `json:"webhooks"`
	MultiTenancy        bool `json:"multi_tenancy"`
	RBAC                bool `json:"rbac"`
	BackupRestore       bool `json:"backup_restore"`
	UpgradeSupport      bool `json:"upgrade_support"`
	RepairSupport       bool `json:"repair_support"`
	SelfHealing         bool `json:"self_healing"`
}

// ProviderInfo holds provider metadata
type ProviderInfo struct {
	ID           string               `json:"id"`
	Name         string               `json:"name"`
	Version      string               `json:"version"`
	Description  string               `json:"description"`
	Website      string               `json:"website"`
	Author       string               `json:"author"`
	License      string               `json:"license"`
	Capabilities ProviderCapabilities `json:"capabilities"`
	Tags         []string             `json:"tags"`
	MinVersion   string               `json:"min_version,omitempty"`
	MaxVersion   string               `json:"max_version,omitempty"`
}

// ProviderStatus represents the current status of a provider
type ProviderStatus struct {
	ProviderID string                 `json:"provider_id"`
	Status     string                 `json:"status"` // running, stopped, error, connecting, disconnected
	Connected  bool                   `json:"connected"`
	LastCheck  time.Time              `json:"last_check"`
	Uptime     time.Duration          `json:"uptime"`
	Version    string                 `json:"version"`
	Healthy    bool                   `json:"healthy"`
	Error      string                 `json:"error,omitempty"`
	Details    map[string]interface{} `json:"details,omitempty"`
}

// HealthResult represents a health check result
type HealthResult struct {
	Healthy   bool                   `json:"healthy"`
	Message   string                 `json:"message"`
	Checks    map[string]HealthCheck `json:"checks"`
	Timestamp time.Time              `json:"timestamp"`
}

// HealthCheck represents an individual health check
type HealthCheck struct {
	Name      string                 `json:"name"`
	Status    string                 `json:"status"` // pass, warn, fail
	Message   string                 `json:"message"`
	Timestamp time.Time              `json:"timestamp"`
	Details   map[string]interface{} `json:"details,omitempty"`
}

// DiscoveryResult contains discovered infrastructure
type DiscoveryResult struct {
	ProviderID    string              `json:"provider_id"`
	Hub           *HubInfo            `json:"hub,omitempty"`
	Agents        []*AgentInfo        `json:"agents,omitempty"`
	DockerEngines []*DockerEngineInfo `json:"docker_engines,omitempty"`
	PodmanEngines []*PodmanEngineInfo `json:"podman_engines,omitempty"`
	Containerd    []*ContainerdInfo   `json:"containerd,omitempty"`
	Networks      []*NetworkInfo      `json:"networks,omitempty"`
	Volumes       []*VolumeInfo       `json:"volumes,omitempty"`
	Containers    []*ContainerInfo    `json:"containers,omitempty"`
	Databases     []*DatabaseInfo     `json:"databases,omitempty"`
	AIServices    []*AIServiceInfo    `json:"ai_services,omitempty"`
	Applications  []*ApplicationInfo  `json:"applications,omitempty"`
	Servers       []*ServerInfo       `json:"servers,omitempty"`
	RemoteNodes   []*RemoteNodeInfo   `json:"remote_nodes,omitempty"`
	ClusterNodes  []*ClusterNodeInfo  `json:"cluster_nodes,omitempty"`
	Timestamp     time.Time           `json:"timestamp"`
}

// HubInfo represents a Beszel Hub
type HubInfo struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Endpoint  string            `json:"endpoint"`
	Version   string            `json:"version"`
	Status    string            `json:"status"`
	Agents    int               `json:"agents"`
	Configs   int               `json:"configs"`
	Alerts    int               `json:"alerts"`
	StartedAt time.Time         `json:"started_at"`
	Labels    map[string]string `json:"labels"`
}

// AgentInfo represents a Beszel Agent
type AgentInfo struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Endpoint     string            `json:"endpoint"`
	Version      string            `json:"version"`
	Status       string            `json:"status"` // online, offline, degraded
	LastSeen     time.Time         `json:"last_seen"`
	OS           string            `json:"os"`
	Arch         string            `json:"arch"`
	CPU          float64           `json:"cpu"`
	Memory       float64           `json:"memory"`
	Disk         float64           `json:"disk"`
	Labels       map[string]string `json:"labels"`
	Capabilities []string          `json:"capabilities"`
}

// DockerEngineInfo represents a Docker engine
type DockerEngineInfo struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Endpoint   string            `json:"endpoint"`
	Version    string            `json:"version"`
	APIVersion string            `json:"api_version"`
	OS         string            `json:"os"`
	Arch       string            `json:"arch"`
	Containers int               `json:"containers"`
	Images     int               `json:"images"`
	Status     string            `json:"status"`
	Labels     map[string]string `json:"labels"`
}

// PodmanEngineInfo represents a Podman engine
type PodmanEngineInfo struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Endpoint   string            `json:"endpoint"`
	Version    string            `json:"version"`
	OS         string            `json:"os"`
	Arch       string            `json:"arch"`
	Containers int               `json:"containers"`
	Images     int               `json:"images"`
	Status     string            `json:"status"`
	Labels     map[string]string `json:"labels"`
}

// ContainerdInfo represents a containerd instance
type ContainerdInfo struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Endpoint   string            `json:"endpoint"`
	Version    string            `json:"version"`
	Status     string            `json:"status"`
	Containers int               `json:"containers"`
	Images     int               `json:"images"`
	Labels     map[string]string `json:"labels"`
}

// NetworkInfo represents a Docker network
type NetworkInfo struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Driver     string            `json:"driver"`
	Scope      string            `json:"scope"`
	Internal   bool              `json:"internal"`
	Attachable bool              `json:"attachable"`
	Ingress    bool              `json:"ingress"`
	IPAM       IPAMInfo          `json:"ipam"`
	Containers []string          `json:"containers"`
	Labels     map[string]string `json:"labels"`
	Created    time.Time         `json:"created"`
}

// IPAMInfo represents IPAM configuration
type IPAMInfo struct {
	Driver  string            `json:"driver"`
	Options map[string]string `json:"options"`
	Config  []IPAMConfig      `json:"config"`
}

// IPAMConfig represents an IPAM config
type IPAMConfig struct {
	Subnet       string            `json:"subnet"`
	IPRange      string            `json:"ip_range"`
	Gateway      string            `json:"gateway"`
	AuxAddresses map[string]string `json:"aux_addresses"`
}

// VolumeInfo represents a Docker volume
type VolumeInfo struct {
	Name       string            `json:"name"`
	Driver     string            `json:"driver"`
	Mountpoint string            `json:"mountpoint"`
	CreatedAt  time.Time         `json:"created_at"`
	Labels     map[string]string `json:"labels"`
	Scope      string            `json:"scope"`
	Options    map[string]string `json:"options"`
	Usage      VolumeUsage       `json:"usage"`
}

// VolumeUsage represents volume usage stats
type VolumeUsage struct {
	Size  uint64 `json:"size"`
	Used  uint64 `json:"used"`
	Free  uint64 `json:"free"`
	Files uint64 `json:"files"`
}

// ContainerInfo represents a container
type ContainerInfo struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Image        string            `json:"image"`
	State        string            `json:"state"`
	Status       string            `json:"status"`
	Ports        []PortMapping     `json:"ports"`
	Created      int64             `json:"created"`
	Labels       map[string]string `json:"labels"`
	CPU          float64           `json:"cpu"`
	Memory       float64           `json:"memory"`
	NetworkIO    NetworkIO         `json:"network_io"`
	BlockIO      BlockIO           `json:"block_io"`
	PIDs         uint64            `json:"pids"`
	RestartCount int               `json:"restart_count"`
	Health       string            `json:"health"`
}

// PortMapping represents a port mapping
type PortMapping struct {
	HostPort      string `json:"host_port"`
	ContainerPort string `json:"container_port"`
	Protocol      string `json:"protocol"`
	HostIP        string `json:"host_ip"`
}

// NetworkIO represents network I/O stats
type NetworkIO struct {
	RxBytes   uint64 `json:"rx_bytes"`
	TxBytes   uint64 `json:"tx_bytes"`
	RxPackets uint64 `json:"rx_packets"`
	TxPackets uint64 `json:"tx_packets"`
	RxErrors  uint64 `json:"rx_errors"`
	TxErrors  uint64 `json:"tx_errors"`
	RxDropped uint64 `json:"rx_dropped"`
	TxDropped uint64 `json:"tx_dropped"`
}

// BlockIO represents block I/O stats
type BlockIO struct {
	ReadBytes  uint64 `json:"read_bytes"`
	WriteBytes uint64 `json:"write_bytes"`
	ReadOps    uint64 `json:"read_ops"`
	WriteOps   uint64 `json:"write_ops"`
}

// DatabaseInfo represents a database
type DatabaseInfo struct {
	ID             string            `json:"id"`
	Name           string            `json:"name"`
	Type           string            `json:"type"` // postgresql, mysql, mariadb, redis, mongodb, sqlite
	Version        string            `json:"version"`
	Endpoint       string            `json:"endpoint"`
	Status         string            `json:"status"`
	Size           uint64            `json:"size"`
	Connections    int               `json:"connections"`
	MaxConnections int               `json:"max_connections"`
	Replication    ReplicationInfo   `json:"replication"`
	Backup         BackupInfo        `json:"backup"`
	Labels         map[string]string `json:"labels"`
}

// ReplicationInfo represents database replication info
type ReplicationInfo struct {
	Enabled      bool   `json:"enabled"`
	Role         string `json:"role"` // primary, replica
	ReplicaCount int    `json:"replica_count"`
	Lag          int64  `json:"lag"` // seconds
}

// BackupInfo represents backup status
type BackupInfo struct {
	Enabled       bool      `json:"enabled"`
	LastBackup    time.Time `json:"last_backup"`
	NextBackup    time.Time `json:"next_backup"`
	RetentionDays int       `json:"retention_days"`
	Status        string    `json:"status"`
}

// AIServiceInfo represents an AI service
type AIServiceInfo struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	Type     string            `json:"type"` // openwebui, ollama, litellm, etc.
	Endpoint string            `json:"endpoint"`
	Version  string            `json:"version"`
	Status   string            `json:"status"`
	Models   []string          `json:"models"`
	GPU      GPUInfo           `json:"gpu"`
	Labels   map[string]string `json:"labels"`
}

// GPUInfo represents GPU information
type GPUInfo struct {
	Available bool        `json:"available"`
	Devices   []GPUDevice `json:"devices"`
}

// GPUDevice represents a GPU device
type GPUDevice struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	MemoryTotal uint64  `json:"memory_total"`
	MemoryUsed  uint64  `json:"memory_used"`
	Utilization float64 `json:"utilization"`
	Temperature float64 `json:"temperature"`
	PowerDraw   float64 `json:"power_draw"`
}

// ApplicationInfo represents an application
type ApplicationInfo struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Type       string            `json:"type"`
	Endpoint   string            `json:"endpoint"`
	Version    string            `json:"version"`
	Status     string            `json:"status"`
	Containers []string          `json:"containers"`
	Labels     map[string]string `json:"labels"`
}

// ServerInfo represents a server
type ServerInfo struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	Endpoint string            `json:"endpoint"`
	OS       string            `json:"os"`
	Arch     string            `json:"arch"`
	CPU      CPUInfo           `json:"cpu"`
	Memory   MemoryInfo        `json:"memory"`
	Disk     DiskInfo          `json:"disk"`
	GPU      GPUInfo           `json:"gpu"`
	Network  NetworkIO         `json:"network"`
	Status   string            `json:"status"`
	Labels   map[string]string `json:"labels"`
}

// CPUInfo represents CPU information
type CPUInfo struct {
	Cores       int     `json:"cores"`
	Model       string  `json:"model"`
	Usage       float64 `json:"usage"`
	Temperature float64 `json:"temperature"`
	Frequency   float64 `json:"frequency"`
}

// MemoryInfo represents memory information
type MemoryInfo struct {
	Total     uint64  `json:"total"`
	Used      uint64  `json:"used"`
	Available uint64  `json:"available"`
	Percent   float64 `json:"percent"`
	SwapTotal uint64  `json:"swap_total"`
	SwapUsed  uint64  `json:"swap_used"`
}

// DiskInfo represents disk information
type DiskInfo struct {
	Total      uint64  `json:"total"`
	Used       uint64  `json:"used"`
	Free       uint64  `json:"free"`
	Percent    float64 `json:"percent"`
	ReadIOPS   uint64  `json:"read_iops"`
	WriteIOPS  uint64  `json:"write_iops"`
	ReadBytes  uint64  `json:"read_bytes"`
	WriteBytes uint64  `json:"write_bytes"`
}

// RemoteNodeInfo represents a remote node
type RemoteNodeInfo struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	Endpoint string            `json:"endpoint"`
	Status   string            `json:"status"`
	LastSeen time.Time         `json:"last_seen"`
	OS       string            `json:"os"`
	Arch     string            `json:"arch"`
	Labels   map[string]string `json:"labels"`
}

// ClusterNodeInfo represents a cluster node
type ClusterNodeInfo struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Endpoint  string            `json:"endpoint"`
	Role      string            `json:"role"` // manager, worker
	Status    string            `json:"status"`
	Labels    map[string]string `json:"labels"`
	Resources ClusterResources  `json:"resources"`
}

// ClusterResources represents cluster resources
type ClusterResources struct {
	CPUTotal    float64 `json:"cpu_total"`
	CPUUsed     float64 `json:"cpu_used"`
	MemoryTotal uint64  `json:"memory_total"`
	MemoryUsed  uint64  `json:"memory_used"`
	DiskTotal   uint64  `json:"disk_total"`
	DiskUsed    uint64  `json:"disk_used"`
}

// MetricsOptions holds options for metrics queries
type MetricsOptions struct {
	NodeIDs      []string          `json:"node_ids,omitempty"`
	ContainerIDs []string          `json:"container_ids,omitempty"`
	Metrics      []string          `json:"metrics,omitempty"`
	StartTime    time.Time         `json:"start_time,omitempty"`
	EndTime      time.Time         `json:"end_time,omitempty"`
	Interval     time.Duration     `json:"interval,omitempty"`
	Aggregation  string            `json:"aggregation,omitempty"` // avg, max, min, sum
	Filters      map[string]string `json:"filters,omitempty"`
}

// MetricsResult contains metrics data
type MetricsResult struct {
	ProviderID       string            `json:"provider_id"`
	NodeMetrics      []NodeMetric      `json:"node_metrics"`
	ContainerMetrics []ContainerMetric `json:"container_metrics"`
	Timestamp        time.Time         `json:"timestamp"`
}

// NodeMetric represents a node metric
type NodeMetric struct {
	NodeID    string             `json:"node_id"`
	Metrics   map[string]float64 `json:"metrics"`
	Timestamp time.Time          `json:"timestamp"`
}

// ContainerMetric represents a container metric
type ContainerMetric struct {
	ContainerID string             `json:"container_id"`
	Metrics     map[string]float64 `json:"metrics"`
	Timestamp   time.Time          `json:"timestamp"`
}

// AlertOptions holds options for alerts queries
type AlertOptions struct {
	NodeIDs    []string  `json:"node_ids,omitempty"`
	Severities []string  `json:"severities,omitempty"`
	States     []string  `json:"states,omitempty"` // firing, resolved, acknowledged
	StartTime  time.Time `json:"start_time,omitempty"`
	EndTime    time.Time `json:"end_time,omitempty"`
	Limit      int       `json:"limit,omitempty"`
	Offset     int       `json:"offset,omitempty"`
}

// AlertsResult contains alerts data
type AlertsResult struct {
	ProviderID string    `json:"provider_id"`
	Alerts     []Alert   `json:"alerts"`
	Total      int       `json:"total"`
	Timestamp  time.Time `json:"timestamp"`
}

// Alert represents an alert
type Alert struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Severity     string            `json:"severity"` // critical, warning, info
	State        string            `json:"state"`    // firing, resolved, acknowledged
	Message      string            `json:"message"`
	Labels       map[string]string `json:"labels"`
	Annotations  map[string]string `json:"annotations"`
	StartsAt     time.Time         `json:"starts_at"`
	EndsAt       time.Time         `json:"ends_at,omitempty"`
	GeneratorURL string            `json:"generator_url,omitempty"`
}

// HistoryOptions holds options for historical queries
type HistoryOptions struct {
	NodeIDs      []string      `json:"node_ids,omitempty"`
	ContainerIDs []string      `json:"container_ids,omitempty"`
	Metrics      []string      `json:"metrics,omitempty"`
	StartTime    time.Time     `json:"start_time"`
	EndTime      time.Time     `json:"end_time"`
	Interval     time.Duration `json:"interval,omitempty"`
	Aggregation  string        `json:"aggregation,omitempty"`
}

// HistoryResult contains historical data
type HistoryResult struct {
	ProviderID string            `json:"provider_id"`
	TimeSeries []TimeSeriesPoint `json:"time_series"`
	StartTime  time.Time         `json:"start_time"`
	EndTime    time.Time         `json:"end_time"`
	Interval   time.Duration     `json:"interval"`
}

// TimeSeriesPoint represents a point in time series
type TimeSeriesPoint struct {
	Timestamp   time.Time          `json:"timestamp"`
	NodeID      string             `json:"node_id,omitempty"`
	ContainerID string             `json:"container_id,omitempty"`
	Metrics     map[string]float64 `json:"metrics"`
}

// NodesResult contains nodes data
type NodesResult struct {
	ProviderID string    `json:"provider_id"`
	Nodes      []Node    `json:"nodes"`
	Total      int       `json:"total"`
	Timestamp  time.Time `json:"timestamp"`
}

// Node represents a monitored node
type Node struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Endpoint     string            `json:"endpoint"`
	Status       string            `json:"status"` // online, offline, degraded
	OS           string            `json:"os"`
	Arch         string            `json:"arch"`
	CPU          CPUInfo           `json:"cpu"`
	Memory       MemoryInfo        `json:"memory"`
	Disk         DiskInfo          `json:"disk"`
	GPU          GPUInfo           `json:"gpu"`
	Network      NetworkIO         `json:"network"`
	Labels       map[string]string `json:"labels"`
	LastSeen     time.Time         `json:"last_seen"`
	AgentVersion string            `json:"agent_version"`
}

// ContainerOptions holds options for container queries
type ContainerOptions struct {
	NodeIDs    []string `json:"node_ids,omitempty"`
	Names      []string `json:"names,omitempty"`
	ImageNames []string `json:"image_names,omitempty"`
	States     []string `json:"states,omitempty"` // running, stopped, paused
	All        bool     `json:"all,omitempty"`
	Limit      int      `json:"limit,omitempty"`
	Offset     int      `json:"offset,omitempty"`
}

// ContainersResult contains containers data
type ContainersResult struct {
	ProviderID string          `json:"provider_id"`
	Containers []ContainerInfo `json:"containers"`
	Total      int             `json:"total"`
	Timestamp  time.Time       `json:"timestamp"`
}

// ProcessOptions holds options for process queries
type ProcessOptions struct {
	NodeIDs  []string `json:"node_ids,omitempty"`
	Filter   string   `json:"filter,omitempty"`
	Limit    int      `json:"limit,omitempty"`
	Offset   int      `json:"offset,omitempty"`
	SortBy   string   `json:"sort_by,omitempty"` // cpu, memory, pid
	SortDesc bool     `json:"sort_desc,omitempty"`
}

// ProcessesResult contains process data
type ProcessesResult struct {
	ProviderID string    `json:"provider_id"`
	Processes  []Process `json:"processes"`
	Total      int       `json:"total"`
	Timestamp  time.Time `json:"timestamp"`
}

// Process represents a process
type Process struct {
	PID         int       `json:"pid"`
	PPID        int       `json:"ppid"`
	Name        string    `json:"name"`
	CmdLine     string    `json:"cmdline"`
	User        string    `json:"user"`
	CPU         float64   `json:"cpu"`
	Memory      float64   `json:"memory"`
	MemoryRSS   uint64    `json:"memory_rss"`
	MemoryVMS   uint64    `json:"memory_vms"`
	Status      string    `json:"status"`
	CreateTime  time.Time `json:"create_time"`
	NumThreads  int       `json:"num_threads"`
	OpenFiles   int       `json:"open_files"`
	Connections int       `json:"connections"`
}

// StorageResult contains storage data
type StorageResult struct {
	ProviderID string       `json:"provider_id"`
	Volumes    []VolumeInfo `json:"volumes"`
	Disks      []DiskInfo   `json:"disks"`
	Timestamp  time.Time    `json:"timestamp"`
}

// NetworksResult contains network data
type NetworksResult struct {
	ProviderID string        `json:"provider_id"`
	Networks   []NetworkInfo `json:"networks"`
	Timestamp  time.Time     `json:"timestamp"`
}

// VolumesResult contains volume data
type VolumesResult struct {
	ProviderID string       `json:"provider_id"`
	Volumes    []VolumeInfo `json:"volumes"`
	Timestamp  time.Time    `json:"timestamp"`
}

// LogOptions holds options for log queries
type LogOptions struct {
	NodeIDs      []string  `json:"node_ids,omitempty"`
	ContainerIDs []string  `json:"container_ids,omitempty"`
	Services     []string  `json:"services,omitempty"`
	StartTime    time.Time `json:"start_time,omitempty"`
	EndTime      time.Time `json:"end_time,omitempty"`
	Limit        int       `json:"limit,omitempty"`
	Follow       bool      `json:"follow,omitempty"`
	Tail         int       `json:"tail,omitempty"`
	Since        string    `json:"since,omitempty"`
	Until        string    `json:"until,omitempty"`
	Grep         string    `json:"grep,omitempty"`
}

// LogsResult contains logs data
type LogsResult struct {
	ProviderID string     `json:"provider_id"`
	Logs       []LogEntry `json:"logs"`
	Total      int        `json:"total"`
	Timestamp  time.Time  `json:"timestamp"`
}

// LogEntry represents a log entry
type LogEntry struct {
	Timestamp   time.Time              `json:"timestamp"`
	Source      string                 `json:"source"` // container, node, system
	ContainerID string                 `json:"container_id,omitempty"`
	NodeID      string                 `json:"node_id,omitempty"`
	Level       string                 `json:"level"` // debug, info, warn, error, fatal
	Message     string                 `json:"message"`
	Fields      map[string]interface{} `json:"fields,omitempty"`
}

// EventOptions holds options for event queries
type EventOptions struct {
	NodeIDs      []string  `json:"node_ids,omitempty"`
	ContainerIDs []string  `json:"container_ids,omitempty"`
	Types        []string  `json:"types,omitempty"` // create, start, stop, die, health_status, etc.
	StartTime    time.Time `json:"start_time,omitempty"`
	EndTime      time.Time `json:"end_time,omitempty"`
	Limit        int       `json:"limit,omitempty"`
}

// EventsResult contains events data
type EventsResult struct {
	ProviderID string    `json:"provider_id"`
	Events     []Event   `json:"events"`
	Total      int       `json:"total"`
	Timestamp  time.Time `json:"timestamp"`
}

// Event represents an event
type Event struct {
	ID       string            `json:"id"`
	Type     string            `json:"type"`
	Action   string            `json:"action"`
	Actor    map[string]string `json:"actor"`
	Scope    string            `json:"scope"`
	Time     time.Time         `json:"time"`
	TimeNano int64             `json:"time_nano"`
	Fields   map[string]string `json:"fields,omitempty"`
}

// BackupOptions holds options for backup
type BackupOptions struct {
	IncludeConfigs bool     `json:"include_configs"`
	IncludeData    bool     `json:"include_data"`
	IncludeLogs    bool     `json:"include_logs"`
	Compress       bool     `json:"compress"`
	Encrypt        bool     `json:"encrypt"`
	Password       string   `json:"password,omitempty"`
	OutputPath     string   `json:"output_path,omitempty"`
	NodeIDs        []string `json:"node_ids,omitempty"`
}

// BackupResult contains backup result
type BackupResult struct {
	ProviderID string    `json:"provider_id"`
	BackupID   string    `json:"backup_id"`
	Path       string    `json:"path"`
	Size       int64     `json:"size"`
	Compressed bool      `json:"compressed"`
	Encrypted  bool      `json:"encrypted"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	Status     string    `json:"status"`
	Error      string    `json:"error,omitempty"`
}

// RestoreOptions holds options for restore
type RestoreOptions struct {
	BackupID       string   `json:"backup_id"`
	BackupPath     string   `json:"backup_path"`
	Password       string   `json:"password,omitempty"`
	IncludeConfigs bool     `json:"include_configs"`
	IncludeData    bool     `json:"include_data"`
	Force          bool     `json:"force"`
	TargetNodes    []string `json:"target_nodes,omitempty"`
}

// RestoreResult contains restore result
type RestoreResult struct {
	ProviderID    string    `json:"provider_id"`
	BackupID      string    `json:"backup_id"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	Status        string    `json:"status"`
	Error         string    `json:"error,omitempty"`
	ItemsRestored int       `json:"items_restored"`
}

// UpgradeOptions holds options for upgrade
type UpgradeOptions struct {
	Version         string `json:"version,omitempty"` // empty = latest
	CheckOnly       bool   `json:"check_only"`
	BackupBefore    bool   `json:"backup_before"`
	Force           bool   `json:"force"`
	RollbackOnError bool   `json:"rollback_on_error"`
}

// UpgradeResult contains upgrade result
type UpgradeResult struct {
	ProviderID    string    `json:"provider_id"`
	FromVersion   string    `json:"from_version"`
	ToVersion     string    `json:"to_version"`
	LatestVersion string    `json:"latest_version"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	Status        string    `json:"status"` // checking, downloading, installing, completed, failed, rolled_back
	Error         string    `json:"error,omitempty"`
	Changelog     string    `json:"changelog,omitempty"`
}

// RepairOptions holds options for repair
type RepairOptions struct {
	Component   string   `json:"component,omitempty"` // hub, agent, database, network, all
	Force       bool     `json:"force"`
	DryRun      bool     `json:"dry_run"`
	TargetNodes []string `json:"target_nodes,omitempty"`
}

// RepairResult contains repair result
type RepairResult struct {
	ProviderID string         `json:"provider_id"`
	Repairs    []RepairAction `json:"repairs"`
	StartTime  time.Time      `json:"start_time"`
	EndTime    time.Time      `json:"end_time"`
	Status     string         `json:"status"` // completed, partial, failed
	Error      string         `json:"error,omitempty"`
}

// RepairAction represents a repair action
type RepairAction struct {
	Component   string    `json:"component"`
	Action      string    `json:"action"`
	Description string    `json:"description"`
	Success     bool      `json:"success"`
	Error       string    `json:"error,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
}
