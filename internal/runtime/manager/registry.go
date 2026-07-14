// Package manager implements the Runtime Manager for KATHAL OS
package manager

import (
	"context"
	"fmt"
	"sync"

	"github.com/bakeweb/kathal-os/internal/runtime"
)

// Registry manages all registered runtime providers
type Registry struct {
	mu         sync.RWMutex
	providers  map[runtime.RuntimeType]runtime.Provider
	factories  map[runtime.RuntimeType]runtime.ProviderFactory
	configs    map[runtime.RuntimeType]runtime.ProviderConfig
	activeType runtime.RuntimeType
}

// NewRegistry creates a new provider registry
func NewRegistry() *Registry {
	return &Registry{
		providers: make(map[runtime.RuntimeType]runtime.Provider),
		factories: make(map[runtime.RuntimeType]runtime.ProviderFactory),
		configs:   make(map[runtime.RuntimeType]runtime.ProviderConfig),
	}
}

// RegisterFactory registers a provider factory
func (r *Registry) RegisterFactory(rt runtime.RuntimeType, factory runtime.ProviderFactory) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.factories[rt] = factory
}

// RegisterProvider registers a provider instance
func (r *Registry) RegisterProvider(rt runtime.RuntimeType, p runtime.Provider) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.providers[rt] = p
}

// RegisterConfig registers a provider configuration
func (r *Registry) RegisterConfig(rt runtime.RuntimeType, config runtime.ProviderConfig) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.configs[rt] = config
}

// GetProvider returns a provider by type
func (r *Registry) GetProvider(rt runtime.RuntimeType) (runtime.Provider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.providers[rt]
	return p, ok
}

// GetFactory returns a factory by type
func (r *Registry) GetFactory(rt runtime.RuntimeType) (runtime.ProviderFactory, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	f, ok := r.factories[rt]
	return f, ok
}

// GetConfig returns a provider configuration
func (r *Registry) GetConfig(rt runtime.RuntimeType) (runtime.ProviderConfig, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	c, ok := r.configs[rt]
	return c, ok
}

// ListProviders returns all registered providers
func (r *Registry) ListProviders() []runtime.RuntimeType {
	r.mu.RLock()
	defer r.mu.RUnlock()
	types := make([]runtime.RuntimeType, 0, len(r.providers))
	for rt := range r.providers {
		types = append(types, rt)
	}
	return types
}

// ListFactories returns all registered factories
func (r *Registry) ListFactories() []runtime.RuntimeType {
	r.mu.RLock()
	defer r.mu.RUnlock()
	types := make([]runtime.RuntimeType, 0, len(r.factories))
	for rt := range r.factories {
		types = append(types, rt)
	}
	return types
}

// SetActive sets the active runtime type
func (r *Registry) SetActive(rt runtime.RuntimeType) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.providers[rt]; !ok {
		return fmt.Errorf("runtime %s not found", rt)
	}
	r.activeType = rt
	return nil
}

// GetActive returns the active runtime
func (r *Registry) GetActive() (runtime.Provider, bool) {
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
func (r *Registry) InitializeAll(ctx context.Context) error {
	r.mu.RLock()
	providers := make([]runtime.Provider, 0, len(r.providers))
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
func (r *Registry) HealthCheckAll(ctx context.Context) map[runtime.RuntimeType]error {
	r.mu.RLock()
	providers := make(map[runtime.RuntimeType]runtime.Provider)
	for rt, p := range r.providers {
		providers[rt] = p
	}
	r.mu.RUnlock()

	results := make(map[runtime.RuntimeType]error)
	for rt, p := range providers {
		results[rt] = p.HealthCheck(ctx)
	}
	return results
}
