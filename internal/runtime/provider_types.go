// Package runtime defines the core runtime interfaces for KATHAL OS
// This is the kernel execution layer - all container, database, and application
// execution goes through the Runtime Manager and its providers.
package runtime

import (
	"time"
)

// ========== Additional Types for Provider Interface ==========

// RuntimeStatus represents the operational status of a runtime
type RuntimeStatus string

const (
	RuntimeStatusUnknown     RuntimeStatus = "unknown"
	RuntimeStatusStarting    RuntimeStatus = "starting"
	RuntimeStatusRunning     RuntimeStatus = "running"
	RuntimeStatusStopping    RuntimeStatus = "stopping"
	RuntimeStatusStopped     RuntimeStatus = "stopped"
	RuntimeStatusError       RuntimeStatus = "error"
	RuntimeStatusDegraded    RuntimeStatus = "degraded"
	RuntimeStatusMaintenance RuntimeStatus = "maintenance"
)

// PushOptions represents image push options
type PushOptions struct {
	RegistryAuth  string
	PrivilegeFunc func() (string, error)
}

// EventsOptions represents event subscription options
type EventsOptions struct {
	Since   string
	Until   string
	Filters map[string][]string
}

// Event represents a runtime event
type Event struct {
	Type     string
	Action   string
	Actor    map[string]string
	Scope    string
	Time     time.Time
	TimeNano int64
}

// Capabilities represents runtime capabilities
type Capabilities struct {
	Containers      bool
	Images          bool
	Volumes         bool
	Networks        bool
	Compose         bool
	Secrets         bool
	Build           bool
	MultiArch       bool
	GPU             bool
	Checkpoint      bool
	Cluster         bool
	Windows         bool
	Linux           bool
	ARM             bool
	AMD64           bool
	Remote          bool
	Events          bool
	HealthCheck     bool
	ResourceLimits  bool
	RestartPolicies bool
	Privileged      bool
	UserNS          bool
	Seccomp         bool
	AppArmor        bool
	SELinux         bool
}

// RepairOptions represents repair options
type RepairOptions struct {
	Component string // "docker", "network", "volume", "container", "all"
	Force     bool
	DryRun    bool
}

// RepairResult represents repair result
type RepairResult struct {
	Component   string
	Action      string
	Description string
	Success     bool
	Error       string
	Timestamp   time.Time
}

// UpgradeOptions represents upgrade options
type UpgradeOptions struct {
	Version         string
	CheckOnly       bool
	BackupBefore    bool
	Force           bool
	RollbackOnError bool
}

// UpgradeResult represents upgrade result
type UpgradeResult struct {
	FromVersion   string
	ToVersion     string
	LatestVersion string
	Status        string
	Error         string
	Changelog     string
}
