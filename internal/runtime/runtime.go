// Package runtime defines the core runtime interfaces for KATHAL OS
package runtime

import (
	"context"
	"io"
	"time"
)

// RuntimeType represents the type of runtime
type RuntimeType string

const (
	RuntimeTypeDocker     RuntimeType = "docker"
	RuntimeTypeContainerd RuntimeType = "containerd"
	RuntimeTypePodman     RuntimeType = "podman"
	RuntimeTypeWASM       RuntimeType = "wasm"
	RuntimeTypeNative     RuntimeType = "native"
)

// Runtime defines the interface that all runtimes must implement
type Runtime interface {
	// Metadata
	Type() RuntimeType
	Name() string
	Version() string
	IsAvailable(ctx context.Context) bool

	// Lifecycle
	Initialize(ctx context.Context) error
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	HealthCheck(ctx context.Context) error

	// Container Operations
	CreateContainer(ctx context.Context, spec ContainerSpec) (Container, error)
	GetContainer(ctx context.Context, id string) (Container, error)
	ListContainers(ctx context.Context, opts ListOptions) ([]Container, error)

	// Image Operations
	PullImage(ctx context.Context, ref string, opts PullOptions) (Image, error)
	BuildImage(ctx context.Context, opts BuildOptions) (Image, error)
	ListImages(ctx context.Context, opts ListOptions) ([]Image, error)
	RemoveImage(ctx context.Context, id string) error

	// Volume Operations
	CreateVolume(ctx context.Context, spec VolumeSpec) (Volume, error)
	GetVolume(ctx context.Context, id string) (Volume, error)
	ListVolumes(ctx context.Context, opts ListOptions) ([]Volume, error)
	RemoveVolume(ctx context.Context, id string) error

	// Network Operations
	CreateNetwork(ctx context.Context, spec NetworkSpec) (Network, error)
	GetNetwork(ctx context.Context, id string) (Network, error)
	ListNetworks(ctx context.Context, opts ListOptions) ([]Network, error)
	RemoveNetwork(ctx context.Context, id string) error

	// Compose Operations
	DeployCompose(ctx context.Context, compose ComposeSpec) (Deployment, error)
	GetDeployment(ctx context.Context, name string) (Deployment, error)
	ListDeployments(ctx context.Context, opts ListOptions) ([]Deployment, error)
	RemoveDeployment(ctx context.Context, name string) error

	// System Operations
	GetSystemInfo(ctx context.Context) (SystemInfo, error)
	GetResourceUsage(ctx context.Context) (ResourceUsage, error)
}

// ContainerSpec defines the specification for creating a container
type ContainerSpec struct {
	Name           string
	Image          string
	Command        []string
	Args           []string
	Env            map[string]string
	Labels         map[string]string
	Ports          []PortBinding
	Volumes        []VolumeMount
	Networks       []string
	Resources      ResourceLimits
	RestartPolicy  RestartPolicy
	WorkingDir     string
	User           string
	Privileged     bool
	CapAdd         []string
	CapDrop        []string
	Devices        []DeviceMapping
	DNS            []string
	DNSOptions     []string
	DNSSearch      []string
	ExtraHosts     map[string]string
	Init           bool
	TTY            bool
	StdinOpen      bool
	Entrypoint     []string
	Binds          []string
	RestartRetries int
}

// Container represents a running or stopped container
type Container interface {
	ID() string
	Name() string
	Image() string
	Status() ContainerStatus
	State() ContainerState
	Ports() []PortMapping
	Labels() map[string]string
	CreatedAt() string
	StartedAt() string
	FinishedAt() string

	Start(ctx context.Context) error
	Stop(ctx context.Context, timeout *int) error
	Restart(ctx context.Context, timeout *int) error
	Pause(ctx context.Context) error
	Unpause(ctx context.Context) error
	Kill(ctx context.Context, signal string) error
	Remove(ctx context.Context, opts RemoveOptions) error

	Logs(ctx context.Context, opts LogOptions) (io.ReadCloser, error)
	Stats(ctx context.Context) (ContainerStats, error)
	Exec(ctx context.Context, opts ExecOptions) (ExecInstance, error)
	Commit(ctx context.Context, opts CommitOptions) (Image, error)
	Export(ctx context.Context) (io.ReadCloser, error)
	Resize(ctx context.Context, height, width uint) error
	Wait(ctx context.Context, condition WaitCondition) (<-chan WaitResult, error)
	Update(ctx context.Context, opts UpdateOptions) error
}

// ContainerStatus represents the high-level status of a container
type ContainerStatus string

const (
	ContainerStatusCreated    ContainerStatus = "created"
	ContainerStatusRunning    ContainerStatus = "running"
	ContainerStatusPaused     ContainerStatus = "paused"
	ContainerStatusRestarting ContainerStatus = "restarting"
	ContainerStatusExited     ContainerStatus = "exited"
	ContainerStatusDead       ContainerStatus = "dead"
	ContainerStatusRemoving   ContainerStatus = "removing"
)

// ContainerState represents the detailed state of a container
type ContainerState struct {
	Status     ContainerStatus
	Running    bool
	Paused     bool
	Restarting bool
	OOMKilled  bool
	Dead       bool
	PID        int
	ExitCode   int
	Error      string
	StartedAt  string
	FinishedAt string
}

// PortMapping represents a port mapping
type PortMapping struct {
	ContainerPort uint16
	HostPort      uint16
	Protocol      string
	HostIP        string
}

// VolumeMount represents a volume mount
type VolumeMount struct {
	Source        string
	Target        string
	ReadOnly      bool
	Type          string
	BindOptions   *BindOptions
	VolumeOptions *VolumeOptions
}

// BindOptions for bind mounts
type BindOptions struct {
	Propagation  string
	NonRecursive bool
}

// VolumeOptions for named volumes
type VolumeOptions struct {
	NoCopy       bool
	Labels       map[string]string
	DriverConfig *DriverConfig
}

// DeviceMapping represents a device mapping
type DeviceMapping struct {
	PathOnHost        string
	PathInContainer   string
	CgroupPermissions string
}

// ResourceLimits defines resource constraints
type ResourceLimits struct {
	CPUShares            int64
	CPUQuota             int64
	CPUPeriod            int64
	CPUs                 float64
	CPUSetCPUs           string
	CPUSetMems           string
	Memory               int64
	MemorySwap           int64
	MemoryReservation    int64
	MemorySwappiness     int64
	KernelMemory         int64
	OOMKillDisable       bool
	PidsLimit            int64
	Ulimits              []Ulimit
	BlkioWeight          uint16
	BlkioWeightDevice    []WeightDevice
	BlkioDeviceReadBps   []ThrottleDevice
	BlkioDeviceWriteBps  []ThrottleDevice
	BlkioDeviceReadIOps  []ThrottleDevice
	BlkioDeviceWriteIOps []ThrottleDevice
}

// Ulimit represents a ulimit setting
type Ulimit struct {
	Name string
	Soft int64
	Hard int64
}

// WeightDevice represents a block IO weight device
type WeightDevice struct {
	Path   string
	Weight uint16
}

// ThrottleDevice represents a block IO throttle device
type ThrottleDevice struct {
	Path string
	Rate int64
}

// RestartPolicy defines the restart policy
type RestartPolicy struct {
	Name              string
	MaximumRetryCount int
	RetryCount        int
}

// ContainerStats represents container resource usage statistics
type ContainerStats struct {
	CPUStats     CPUStats
	MemoryStats  MemoryStats
	NetworkStats NetworkStats
	BlkioStats   BlkioStats
	PidsStats    PidsStats
	Read         time.Time
}

// CPUStats represents CPU statistics
type CPUStats struct {
	CPUUsage       CPUUsage
	SystemCPUUsage uint64
	OnlineCPUs     uint64
	ThrottlingData ThrottlingData
}

// CPUUsage represents CPU usage breakdown
type CPUUsage struct {
	TotalUsage        uint64
	UsageInUsermode   uint64
	UsageInKernelmode uint64
	PercpuUsage       []uint64
}

// ThrottlingData represents CPU throttling data
type ThrottlingData struct {
	Periods          uint64
	ThrottledPeriods uint64
	ThrottledTime    uint64
}

// MemoryStats represents memory statistics
type MemoryStats struct {
	Usage    uint64
	MaxUsage uint64
	Limit    uint64
	Stats    map[string]uint64
}

// NetworkStats represents network statistics
type NetworkStats map[string]NetworkInterfaceStats

// NetworkInterfaceStats represents stats for a network interface
type NetworkInterfaceStats struct {
	RxBytes   uint64
	RxPackets uint64
	RxErrors  uint64
	RxDropped uint64
	TxBytes   uint64
	TxPackets uint64
	TxErrors  uint64
	TxDropped uint64
}

// BlkioStats represents block IO statistics
type BlkioStats struct {
	IOServiceBytesRecursive []BlkioStatEntry
	IOServicedRecursive     []BlkioStatEntry
	IOQueueRecursive        []BlkioStatEntry
	IOServiceTimeRecursive  []BlkioStatEntry
	IOWaitTimeRecursive     []BlkioStatEntry
	IOMergedRecursive       []BlkioStatEntry
	IOTimeRecursive         []BlkioStatEntry
	IOSectorsRecursive      []BlkioStatEntry
}

// BlkioStatEntry represents a block IO stat entry
type BlkioStatEntry struct {
	Major uint64
	Minor uint64
	Op    string
	Value uint64
}

// PidsStats represents PID statistics
type PidsStats struct {
	Current uint64
	Limit   uint64
}

// LogOptions represents log retrieval options
type LogOptions struct {
	Follow     bool
	Tail       string
	Since      string
	Until      string
	Timestamps bool
	Details    bool
}

// ExecOptions represents exec options
type ExecOptions struct {
	Cmd          []string
	AttachStdin  bool
	AttachStdout bool
	AttachStderr bool
	Tty          bool
	Env          []string
	WorkingDir   string
	User         string
	Privileged   bool
}

// ExecInstance represents an exec instance
type ExecInstance interface {
	Start(ctx context.Context, opts ExecStartOptions) error
	Wait(ctx context.Context) (int, error)
	Resize(ctx context.Context, height, width uint) error
	Close() error
}

// ExecStartOptions represents exec start options
type ExecStartOptions struct {
	Detach bool
	Tty    bool
}

// CommitOptions represents commit options
type CommitOptions struct {
	Repo    string
	Tag     string
	Author  string
	Comment string
	Changes []string
	Pause   bool
}

// WaitCondition represents container wait condition
type WaitCondition string

const (
	WaitConditionNotRunning WaitCondition = "not-running"
	WaitConditionNextExit   WaitCondition = "next-exit"
	WaitConditionRemoved    WaitCondition = "removed"
)

// WaitResult represents container wait result
type WaitResult struct {
	StatusCode int64
	Error      error
}

// RemoveOptions represents container removal options
type RemoveOptions struct {
	RemoveVolumes bool
	Force         bool
	Link          bool
}

// UpdateOptions represents container update options
type UpdateOptions struct {
	Resources     ResourceLimits
	RestartPolicy RestartPolicy
}

// Image represents a container image
type Image interface {
	ID() string
	RepoTags() []string
	RepoDigests() []string
	Size() int64
	Created() string
	Labels() map[string]string
	Architecture() string
	OS() string
	Layers() []Layer
	Config() ImageConfig
	History() []HistoryEntry
}

// Layer represents an image layer
type Layer struct {
	ID        string
	Size      int64
	Created   string
	CreatedBy string
}

// ImageConfig represents image configuration
type ImageConfig struct {
	User         string
	ExposedPorts map[string]struct{}
	Env          []string
	Entrypoint   []string
	Cmd          []string
	Volumes      map[string]struct{}
	WorkingDir   string
	Labels       map[string]string
	StopSignal   string
	ArgsEscaped  bool
}

// HistoryEntry represents an image history entry
type HistoryEntry struct {
	ID        string
	Created   int64
	CreatedBy string
	Tags      []string
	Size      int64
	Comment   string
}

// Volume represents a volume
type Volume interface {
	Name() string
	Driver() string
	Mountpoint() string
	CreatedAt() string
	Labels() map[string]string
	Scope() string
	Options() map[string]string
}

// Network represents a network
type Network interface {
	ID() string
	Name() string
	Driver() string
	Scope() string
	IPAM() IPAMConfig
	Internal() bool
	Attachable() bool
	Ingress() bool
	ConfigOnly() bool
	Containers() map[string]NetworkContainer
	Options() map[string]string
	Labels() map[string]string
	Created() string
}

// NetworkContainer represents a container connected to a network
type NetworkContainer struct {
	Name        string
	EndpointID  string
	MacAddress  string
	IPv4Address string
	IPv6Address string
}

// IPAMConfig represents IPAM configuration
type IPAMConfig struct {
	Driver  string
	Config  []IPAMConfigItem
	Options map[string]string
}

// IPAMConfigItem represents an IPAM config item
type IPAMConfigItem struct {
	Subnet       string
	IPRange      string
	Gateway      string
	AuxAddresses map[string]string
}

// Deployment represents a compose deployment
type Deployment interface {
	Name() string
	Services() map[string]ServiceStatus
	Status() DeploymentStatus
	CreatedAt() string
	UpdatedAt() string
	Labels() map[string]string

	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	Restart(ctx context.Context) error
	Remove(ctx context.Context, opts RemoveOptions) error
	Scale(ctx context.Context, scale map[string]int) error
	Logs(ctx context.Context, opts LogOptions) (io.ReadCloser, error)
	Config(ctx context.Context) (string, error)
}

// ServiceStatus represents the status of a service in a deployment
type ServiceStatus struct {
	Name     string
	Replicas int
	Running  int
	Stopped  int
	Failed   int
	Image    string
	Ports    []PortMapping
	Status   string
}

// DeploymentStatus represents deployment status
type DeploymentStatus string

const (
	DeploymentStatusRunning  DeploymentStatus = "running"
	DeploymentStatusStopped  DeploymentStatus = "stopped"
	DeploymentStatusPartial  DeploymentStatus = "partial"
	DeploymentStatusFailed   DeploymentStatus = "failed"
	DeploymentStatusCreating DeploymentStatus = "creating"
	DeploymentStatusRemoving DeploymentStatus = "removing"
)

// SystemInfo represents system information
type SystemInfo struct {
	ID                 string
	Containers         int
	ContainersRunning  int
	ContainersPaused   int
	ContainersStopped  int
	Images             int
	Driver             string
	DriverStatus       [][]string
	PluginList         []PluginInfo
	MemoryLimit        bool
	SwapLimit          bool
	KernelMemory       bool
	CPUShares          bool
	CPUQuota           bool
	CPUPeriod          bool
	CPUCFSPeriod       bool
	CPUCFSQuota        bool
	CPUSet             bool
	PIDsLimit          bool
	IPv4Forwarding     bool
	BridgeNfIptables   bool
	BridgeNfIP6tables  bool
	OOMKillDisable     bool
	NGoroutines        int
	NEventsListener    int
	NFd                int
	ExperimentalBuild  bool
	ServerVersion      string
	OperatingSystem    string
	OSVersion          string
	OSType             string
	Architecture       string
	CPUs               int
	TotalMemory        int64
	DockerRootDir      string
	HTTPProxy          string
	HTTPSProxy         string
	NoProxy            string
	Name               string
	Labels             []string
	RegistryConfig     map[string]RegistryConfig
	LiveRestoreEnabled bool
	Isolation          string
	InitBinary         string
	ContainerdCommit   string
	RuncCommit         string
	InitCommit         string
	SecurityOptions    []string
	ProductLicense     string
	DefaultRuntime     string
	Swarm              SwarmInfo
	Plugins            PluginsInfo
	Runtimes           map[string]RuntimeInfo
	LoggingDriver      string
	CgroupDriver       string
	CgroupVersion      string
	KernelVersion      string
	IndexServerAddress string
	Warning            string
}

// PluginInfo represents plugin information
type PluginInfo struct {
	ID          string
	Name        string
	Tag         string
	Description string
	Enabled     bool
}

// RegistryConfig represents registry configuration
type RegistryConfig struct {
	IndexServerAddress    string
	InsecureRegistryCIDRs []string
	Mirrors               []RegistryMirror
}

// RegistryMirror represents a registry mirror
type RegistryMirror struct {
	URL string
}

// SwarmInfo represents swarm information
type SwarmInfo struct {
	NodeID           string
	NodeAddr         string
	LocalNodeState   string
	ControlAvailable bool
	Error            string
	RemoteManagers   []PeerNode
	Nodes            int
	Managers         int
	Cluster          ClusterInfo
}

// PeerNode represents a peer node
type PeerNode struct {
	NodeID string
	Addr   string
}

// ClusterInfo represents cluster information
type ClusterInfo struct {
	ID                     string
	Version                ClusterVersion
	Spec                   ClusterSpec
	TLSInfo                TLSInfo
	RootRotationInProgress bool
	DataPathPort           uint32
}

// ClusterVersion represents cluster version
type ClusterVersion struct {
	Index uint64
}

// ClusterSpec represents cluster spec
type ClusterSpec struct {
	Orchestration OrchestrationConfig
	Raft          RaftConfig
	Dispatch      DispatchConfig
	TaskDefaults  TaskDefaults
}

// OrchestrationConfig represents orchestration config
type OrchestrationConfig struct {
	TaskHistoryRetentionLimit TaskHistoryRetentionLimit
}

// TaskHistoryRetentionLimit represents task history retention limit
type TaskHistoryRetentionLimit struct {
	Limit int64
}

// RaftConfig represents raft config
type RaftConfig struct {
	SnapshotInterval             int64
	NumberOfOldSnapshotsToRetain int64
	HeartbeatTick                int64
	ElectionTick                 int64
}

// DispatchConfig represents dispatch config
type DispatchConfig struct {
	HeartbeatPeriod uint64
}

// TaskDefaults represents task defaults
type TaskDefaults struct {
	LogDriver LogDriverConfig
}

// LogDriverConfig represents log driver config
type LogDriverConfig struct {
	Name    string
	Options map[string]string
}

// TLSInfo represents TLS info
type TLSInfo struct {
	TrustRoot           string
	CertIssuerSubject   string
	CertIssuerPublicKey string
}

// PluginsInfo represents plugins info
type PluginsInfo struct {
	Volume        []PluginInfo
	Network       []PluginInfo
	Authorization []PluginInfo
	Log           []PluginInfo
}

// RuntimeInfo represents runtime info
type RuntimeInfo struct {
	Path        string
	RuntimeArgs []string
}

// ResourceUsage represents resource usage
type ResourceUsage struct {
	CPU        CPUUsageInfo
	Memory     MemoryUsageInfo
	Disk       DiskUsageInfo
	Network    NetworkUsageInfo
	GPU        []GPUUsageInfo
	Containers []ContainerResourceUsage
}

// CPUUsageInfo represents CPU usage info
type CPUUsageInfo struct {
	TotalPercent  float64
	PerCPUPercent []float64
	LoadAverage   [3]float64
}

// MemoryUsageInfo represents memory usage info
type MemoryUsageInfo struct {
	Total     uint64
	Available uint64
	Used      uint64
	Free      uint64
	Percent   float64
	SwapTotal uint64
	SwapUsed  uint64
	SwapFree  uint64
}

// DiskUsageInfo represents disk usage info
type DiskUsageInfo struct {
	Total      uint64
	Used       uint64
	Free       uint64
	Percent    float64
	Partitions []PartitionUsage
}

// PartitionUsage represents partition usage
type PartitionUsage struct {
	Device     string
	Mountpoint string
	Fstype     string
	Total      uint64
	Used       uint64
	Free       uint64
	Percent    float64
}

// NetworkUsageInfo represents network usage info
type NetworkUsageInfo struct {
	Interfaces map[string]InterfaceUsage
}

// InterfaceUsage represents interface usage
type InterfaceUsage struct {
	BytesSent   uint64
	BytesRecv   uint64
	PacketsSent uint64
	PacketsRecv uint64
	Errin       uint64
	Errout      uint64
	Dropin      uint64
	Dropout     uint64
}

// GPUUsageInfo represents GPU usage info
type GPUUsageInfo struct {
	ID            string
	Name          string
	MemoryTotal   uint64
	MemoryUsed    uint64
	MemoryFree    uint64
	GPUPercent    float64
	MemoryPercent float64
	Processes     []GPUProcess
}

// GPUProcess represents a GPU process
type GPUProcess struct {
	PID        int
	Name       string
	MemoryUsed uint64
}

// ContainerResourceUsage represents container resource usage
type ContainerResourceUsage struct {
	ContainerID   string
	Name          string
	CPUPercent    float64
	MemoryUsage   uint64
	MemoryLimit   uint64
	MemoryPercent float64
	NetworkRx     uint64
	NetworkTx     uint64
	BlockRead     uint64
	BlockWrite    uint64
	PIDs          uint64
}

// ListOptions represents list options
type ListOptions struct {
	All     bool
	Filters map[string][]string
	Limit   int
	Offset  int
}

// PullOptions represents image pull options
type PullOptions struct {
	RegistryAuth  string
	PrivilegeFunc func() (string, error)
	All           bool
	Platform      string
}

// BuildOptions represents image build options
type BuildOptions struct {
	Dockerfile  string
	Context     string
	Tags        []string
	BuildArgs   map[string]*string
	Labels      map[string]string
	Target      string
	NetworkMode string
	NoCache     bool
	PullParent  bool
	ForceRemove bool
	Memory      int64
	MemorySwap  int64
	CPUSetCPUs  string
	CPUSetMems  string
	CPUShares   int64
	CPUQuota    int64
	CPUPeriod   int64
	ShmSize     int64
	Squash      bool
	Platform    string
	ExtraHosts  []string
	Output      io.Writer
}

// VolumeSpec represents volume specification
type VolumeSpec struct {
	Name       string
	Driver     string
	DriverOpts map[string]string
	Labels     map[string]string
}

// NetworkSpec represents network specification
type NetworkSpec struct {
	Name       string
	Driver     string
	Internal   bool
	Attachable bool
	Ingress    bool
	IPAM       *IPAMConfig
	Options    map[string]string
	Labels     map[string]string
}

// ComposeSpec represents a compose specification
type ComposeSpec struct {
	Name       string
	ProjectDir string
	Config     []byte
	Env        map[string]string
	Files      []string
}

// DriverConfig represents volume driver config
type DriverConfig struct {
	Name    string
	Options map[string]string
}
