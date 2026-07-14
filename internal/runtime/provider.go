// Package runtime defines the core runtime provider interface for KATHAL OS
package runtime

import (
	"context"
	"sync"
)

// Provider is the interface that all runtime providers must implement
// This is the core contract between the Runtime Manager and runtime providers.
type Provider interface {
	// Metadata
	Type() RuntimeType
	Name() string
	Version() string
	Status() RuntimeStatus
	IsAvailable(ctx context.Context) bool

	// Lifecycle
	Initialize(ctx context.Context) error
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	Restart(ctx context.Context) error
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
	InspectImage(ctx context.Context, id string) (Image, error)
	TagImage(ctx context.Context, id string, tag string) error
	PushImage(ctx context.Context, ref string, opts PushOptions) error

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

	// Compose/Deployment Operations
	DeployCompose(ctx context.Context, compose ComposeSpec) (Deployment, error)
	GetDeployment(ctx context.Context, name string) (Deployment, error)
	ListDeployments(ctx context.Context, opts ListOptions) ([]Deployment, error)
	RemoveDeployment(ctx context.Context, name string) error

	// System Operations
	GetSystemInfo(ctx context.Context) (SystemInfo, error)
	GetResourceUsage(ctx context.Context) (ResourceUsage, error)
	Events(ctx context.Context, opts EventsOptions) (<-chan Event, error)

	// Extension Points
	Repair(ctx context.Context, opts RepairOptions) (RepairResult, error)
	Upgrade(ctx context.Context, opts UpgradeOptions) (UpgradeResult, error)
	GetCapabilities() Capabilities
}

// ProviderFactory is a function that creates a new runtime provider
type ProviderFactory func(config ProviderConfig) (Provider, error)

// ProviderConfig holds configuration for a runtime provider
type ProviderConfig struct {
	Name        string                 `json:"name"`
	Type        RuntimeType            `json:"type"`
	Enabled     bool                   `json:"enabled"`
	Priority    int                    `json:"priority"`
	Config      map[string]interface{} `json:"config"`
	Environment map[string]string      `json:"environment"`
	Constraints []Constraint           `json:"constraints"`
}

// Constraint represents a runtime constraint
type Constraint struct {
	Key      string `json:"key"`
	Operator string `json:"operator"` // "equals", "not_equals", "contains", "matches"
	Value    string `json:"value"`
}

// ProviderRegistry manages all registered runtime providers
type ProviderRegistry struct {
	mu         sync.RWMutex
	providers  map[RuntimeType]Provider
	factories  map[RuntimeType]ProviderFactory
	configs    map[RuntimeType]ProviderConfig
	activeType RuntimeType
}

// NewProviderRegistry creates a new provider registry
func NewProviderRegistry() *ProviderRegistry {
	return &ProviderRegistry{
		providers: make(map[RuntimeType]Provider),
		factories: make(map[RuntimeType]ProviderFactory),
		configs:   make(map[RuntimeType]ProviderConfig),
	}
}

// RegisterFactory registers a provider factory
func (r *ProviderRegistry) RegisterFactory(rt RuntimeType, factory ProviderFactory) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.factories[rt] = factory
}

// RegisterProvider registers a provider instance
func (r *ProviderRegistry) RegisterProvider(rt RuntimeType, p Provider) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.providers[rt] = p
}

// RegisterConfig registers a provider configuration
func (r *ProviderRegistry) RegisterConfig(rt RuntimeType, config ProviderConfig) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.configs[rt] = config
}

// GetProvider returns a provider by type
func (r *ProviderRegistry) GetProvider(rt RuntimeType) (Provider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.providers[rt]
	return p, ok
}

// GetFactory returns a factory by type
func (r *ProviderRegistry) GetFactory(rt RuntimeType) (ProviderFactory, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	f, ok := r.factories[rt]
	return f, ok
}

// GetConfig returns a provider configuration
func (r *ProviderRegistry) GetConfig(rt RuntimeType) (ProviderConfig, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	c, ok := r.configs[rt]
	return c, ok
}

// ListProviders returns all registered providers
func (r *ProviderRegistry) ListProviders() []RuntimeType {
	r.mu.RLock()
	defer r.mu.RUnlock()
	types := make([]RuntimeType, 0, len(r.providers))
	for rt := range r.providers {
		types = append(types, rt)
	}
	return types
}

// ListFactories returns all registered factories
func (r *ProviderRegistry) ListFactories() []RuntimeType {
	r.mu.RLock()
	defer r.mu.RUnlock()
	types := make([]RuntimeType, 0, len(r.factories))
	for rt := range r.factories {
		types = append(types, rt)
	}
	return types
}

// SetActive sets the active runtime type
func (r *ProviderRegistry) SetActive(rt RuntimeType) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.providers[rt]; !ok {
		return ErrRuntimeNotFound
	}
	r.activeType = rt
	return nil
}

// GetActive returns the active runtime
func (r *ProviderRegistry) GetActive() (Provider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if r.activeType == "" {
		// Return first available
		for _, p := range r.providers {
			return p, true
		}
		return nil, false
	}
	p, ok := r.providers[r.activeType]
	return p, ok
}

// InitializeAll initializes all registered providers
func (r *ProviderRegistry) InitializeAll(ctx context.Context) error {
	r.mu.RLock()
	providers := make([]Provider, 0, len(r.providers))
	for _, p := range r.providers {
		providers = append(providers, p)
	}
	r.mu.RUnlock()

	var lastErr error
	for _, p := range providers {
		if err := p.Initialize(ctx); err != nil {
			lastErr = err
			// Continue initializing others
		}
	}
	return lastErr
}

// HealthCheckAll runs health checks on all providers
func (r *ProviderRegistry) HealthCheckAll(ctx context.Context) map[RuntimeType]error {
	r.mu.RLock()
	providers := make(map[RuntimeType]Provider)
	for rt, p := range r.providers {
		providers[rt] = p
	}
	r.mu.RUnlock()

	results := make(map[RuntimeType]error)
	for rt, p := range providers {
		results[rt] = p.HealthCheck(ctx)
	}
	return results
}

// ErrRuntimeNotFound is returned when a runtime is not found
var ErrRuntimeNotFound = &RuntimeError{Code: "RUNTIME_NOT_FOUND", Message: "runtime not found"}

// RuntimeError represents a runtime error
type RuntimeError struct {
	Code    string
	Message string
	Err     error
}

func (e *RuntimeError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *RuntimeError) Unwrap() error {
	return e.Err
}
