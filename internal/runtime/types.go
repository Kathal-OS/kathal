package runtime

// ========== Container Extended Types ==========

// ContainerInfo represents detailed container information
type ContainerInfo struct {
	ID              string
	Name            string
	Image           string
	State           string
	Status          string
	Created         string
	Config          interface{}
	HostConfig      interface{}
	NetworkSettings interface{}
	Mounts          []MountPoint
	Driver          string
	Platform        string
	LogPath         string
	RestartCount    int
	SizeRw          int64
	SizeRootFs      int64
}

// MountPoint represents a mount point in a container
type MountPoint struct {
	Type        string
	Source      string
	Destination string
	Mode        string
	RW          bool
	Propagation string
}

// ExecResult represents the result of an exec operation
type ExecResult struct {
	ExitCode int
	Stdout   string
	Stderr   string
	Error    error
}

// StatsOptions represents container stats options
type StatsOptions struct {
	Stream  bool
	OneShot bool
}

// ContainerTop represents container processes
type ContainerTop struct {
	Titles    []string
	Processes [][]string
}

// ContainerInspect represents detailed container inspection
type ContainerInspect struct {
	ID              string
	Name            string
	Image           string
	State           ContainerState
	Config          interface{}
	HostConfig      interface{}
	NetworkSettings interface{}
	Mounts          []MountPoint
	Created         string
	Driver          string
	Platform        string
	LogPath         string
	RestartCount    int
	SizeRw          int64
	SizeRootFs      int64
}

// ========== Image Extended Types ==========

// CreateImageOptions represents image build options
type CreateImageOptions struct {
	Dockerfile string
	Tags       []string
	BuildArgs  map[string]string
	Target     string
	NoCache    bool
	Pull       bool
	Labels     map[string]string
}

// RemoveImageOptions represents image removal options
type RemoveImageOptions struct {
	Force         bool
	PruneChildren bool
}

// PullImageOptions represents image pull options
type PullImageOptions struct {
	RegistryAuth string
}

// PushImageOptions represents image push options
type PushImageOptions struct {
	RegistryAuth string
}

// ImageHistory represents image history entry
type ImageHistory struct {
	ID        string
	Created   int64
	CreatedBy string
	Tags      []string
	Size      int64
	Comment   string
}

// PortBinding represents a port binding configuration
type PortBinding struct {
	ContainerPort uint16
	HostPort      uint16
	Protocol      string
	HostIP        string
}

// Resources is an alias for ResourceLimits for Docker compatibility
type Resources = ResourceLimits

// NetworkMode represents Docker network mode
type NetworkMode string
