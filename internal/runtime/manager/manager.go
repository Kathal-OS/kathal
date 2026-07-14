// Package manager implements the Runtime Manager for KATHAL OS
package manager

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/bakeweb/kathal-os/internal/runtime"
)

// ServiceStatus represents the status of a service
type ServiceStatus struct {
	State     string
	Health    error
	Uptime    time.Duration
	LastCheck time.Time
	Metadata  map[string]string
}

// RuntimeManager manages all runtimes and provides a unified interface
type RuntimeManager struct {
	mu       sync.RWMutex
	runtimes map[runtime.RuntimeType]runtime.Provider
	active   runtime.RuntimeType
	registry *Registry
	config   Config
}

// Config holds runtime manager configuration
type Config struct {
	DefaultRuntime  runtime.RuntimeType
	DockerConfig    runtime.ProviderConfig
	WASMConfig      runtime.ProviderConfig
	EnableDiscovery bool
	AutoRepair      bool
	HealthInterval  time.Duration
}

// DefaultConfig returns default configuration
func DefaultConfig() Config {
	return Config{
		DefaultRuntime:  runtime.RuntimeTypeDocker,
		EnableDiscovery: true,
		AutoRepair:      true,
		HealthInterval:  30 * time.Second,
	}
}

// NewRuntimeManager creates a new runtime manager
func NewRuntimeManager(config Config) (*RuntimeManager, error) {
	rm := &RuntimeManager{
		runtimes: make(map[runtime.RuntimeType]runtime.Provider),
		config:   config,
		registry: NewRegistry(),
	}

	return rm, nil
}

// ========== Service Interface Implementation ==========

// Name returns the service name
func (rm *RuntimeManager) Name() string {
	return "runtime-manager"
}

// Initialize initializes all registered runtimes
func (rm *RuntimeManager) Initialize(ctx context.Context) error {
	var lastErr error
	for rt, r := range rm.runtimes {
		if err := r.Initialize(ctx); err != nil {
			lastErr = fmt.Errorf("failed to initialize %s: %w", rt, err)
			// Continue initializing other runtimes
		}
	}
	return lastErr
}

// Start starts all registered runtimes
func (rm *RuntimeManager) Start(ctx context.Context) error {
	var lastErr error
	for rt, r := range rm.runtimes {
		if err := r.Start(ctx); err != nil {
			lastErr = fmt.Errorf("failed to start %s: %w", rt, err)
		}
	}
	return lastErr
}

// Stop stops all registered runtimes
func (rm *RuntimeManager) Stop(ctx context.Context) error {
	var lastErr error
	for rt, r := range rm.runtimes {
		if err := r.Stop(ctx); err != nil {
			lastErr = fmt.Errorf("failed to stop %s: %w", rt, err)
		}
	}
	return lastErr
}

// Health runs health checks on all runtimes
func (rm *RuntimeManager) Health(ctx context.Context) error {
	for rt, r := range rm.runtimes {
		if err := r.HealthCheck(ctx); err != nil {
			return fmt.Errorf("health check failed for %s: %w", rt, err)
		}
	}
	return nil
}

// Status returns the service status
func (rm *RuntimeManager) Status() ServiceStatus {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	state := "running"
	if len(rm.runtimes) == 0 {
		state = "stopped"
	}

	return ServiceStatus{
		State:     state,
		Health:    nil,
		Uptime:    0, // Would track actual uptime
		LastCheck: time.Now(),
		Metadata:  map[string]string{"active_runtime": string(rm.active)},
	}
}

// Version returns the service version
func (rm *RuntimeManager) Version() string {
	return "1.0.0"
}

// Dependencies returns the service dependencies
func (rm *RuntimeManager) Dependencies() []string {
	return []string{"discovery", "dependency-manager"}
}

// ========== Runtime Management ==========

// GetRuntime returns a runtime by type
func (rm *RuntimeManager) GetRuntime(rt runtime.RuntimeType) (runtime.Provider, error) {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	r, ok := rm.runtimes[rt]
	if !ok {
		return nil, fmt.Errorf("runtime %s not registered", rt)
	}
	return r, nil
}

// GetActiveRuntime returns the currently active runtime
func (rm *RuntimeManager) GetActiveRuntime() (runtime.Provider, error) {
	return rm.GetRuntime(rm.active)
}

// SetActiveRuntime sets the active runtime
func (rm *RuntimeManager) SetActiveRuntime(rt runtime.RuntimeType) error {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	if _, ok := rm.runtimes[rt]; !ok {
		return fmt.Errorf("runtime %s not registered", rt)
	}
	rm.active = rt
	return nil
}

// ListRuntimes returns all registered runtimes
func (rm *RuntimeManager) ListRuntimes() []runtime.RuntimeType {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	types := make([]runtime.RuntimeType, 0, len(rm.runtimes))
	for rt := range rm.runtimes {
		types = append(types, rt)
	}
	return types
}

// RegisterRuntime registers a runtime
func (rm *RuntimeManager) RegisterRuntime(rt runtime.RuntimeType, r runtime.Provider) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	rm.runtimes[rt] = r
	rm.registry.RegisterProvider(rt, r)
}

// UnregisterRuntime unregisters a runtime
func (rm *RuntimeManager) UnregisterRuntime(rt runtime.RuntimeType) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	delete(rm.runtimes, rt)
	if rm.active == rt {
		// Switch to first available runtime
		for rt2 := range rm.runtimes {
			rm.active = rt2
			break
		}
	}
}

// HealthCheck runs health checks on all runtimes
func (rm *RuntimeManager) HealthCheck(ctx context.Context) map[runtime.RuntimeType]error {
	results := make(map[runtime.RuntimeType]error)
	for rt, r := range rm.runtimes {
		results[rt] = r.HealthCheck(ctx)
	}
	return results
}

// GetRuntimeInfo returns information about all runtimes
type RuntimeInfo struct {
	Type       runtime.RuntimeType
	Name       string
	Version    string
	Available  bool
	Health     error
	SystemInfo runtime.SystemInfo
}

func (rm *RuntimeManager) GetRuntimeInfo(ctx context.Context) []RuntimeInfo {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	infos := make([]RuntimeInfo, 0, len(rm.runtimes))
	for rt, r := range rm.runtimes {
		info := RuntimeInfo{
			Type:      rt,
			Name:      r.Name(),
			Version:   r.Version(),
			Available: r.IsAvailable(ctx),
		}
		info.Health = r.HealthCheck(ctx)
		if info.Available && info.Health == nil {
			info.SystemInfo, _ = r.GetSystemInfo(ctx)
		}
		infos = append(infos, info)
	}
	return infos
}

// GetRegistry returns the provider registry
func (rm *RuntimeManager) GetRegistry() *Registry {
	return rm.registry
}
