// Package ai defines the core AI Runtime provider interface for KATHAL OS
package ai

import (
	"context"
	"io"
	"sync"
)

// ========== Provider Types (from types.go) ==========
// AIProviderType, ProviderStatus, ProviderConfig, ProviderCapabilities
// are defined in types.go

// ========== AI Provider Interface ==========

// AIProvider is the core interface that all AI providers must implement
type AIProvider interface {
	// ========== Metadata ==========
	Type() AIProviderType
	Name() string
	Version() string
	Status() ProviderStatus
	IsAvailable(ctx context.Context) bool
	GetCapabilities() ProviderCapabilities
	GetModels() []string
	GetConfig() ProviderConfig

	// ========== Lifecycle ==========
	Initialize(ctx context.Context) error
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	HealthCheck(ctx context.Context) error

	// ========== Chat Completion ==========
	ChatComplete(ctx context.Context, req ChatCompletionRequest) (ChatCompletionResponse, error)
	ChatCompleteStream(ctx context.Context, req ChatCompletionRequest) (<-chan ChatCompletionChunk, error)

	// ========== Completion (Legacy) ==========
	Complete(ctx context.Context, req CompletionRequest) (CompletionResponse, error)
	CompleteStream(ctx context.Context, req CompletionRequest) (<-chan CompletionChunk, error)

	// ========== Embeddings ==========
	CreateEmbeddings(ctx context.Context, req EmbeddingRequest) (EmbeddingResponse, error)

	// ========== Image Generation ==========
	GenerateImage(ctx context.Context, req ImageGenerationRequest) (ImageGenerationResponse, error)
	EditImage(ctx context.Context, req ImageEditRequest) (ImageGenerationResponse, error)
	CreateImageVariation(ctx context.Context, req ImageVariationRequest) (ImageGenerationResponse, error)

	// ========== Audio ==========
	TranscribeAudio(ctx context.Context, req AudioTranscriptionRequest) (AudioResponse, error)
	TranslateAudio(ctx context.Context, req AudioTranslationRequest) (AudioResponse, error)
	CreateSpeech(ctx context.Context, req SpeechRequest) (io.ReadCloser, error)

	// ========== Moderation ==========
	ModerateContent(ctx context.Context, req ModerationRequest) (ModerationResponse, error)

	// ========== Fine-tuning ==========
	CreateFineTune(ctx context.Context, req FineTuneRequest) (FineTuneJob, error)
	GetFineTune(ctx context.Context, id string) (FineTuneJob, error)
	ListFineTunes(ctx context.Context, opts ListOptions) ([]FineTuneJob, error)
	CancelFineTune(ctx context.Context, id string) error

	// ========== Batch Operations ==========
	CreateBatch(ctx context.Context, req BatchRequest) (BatchJob, error)
	GetBatch(ctx context.Context, id string) (BatchJob, error)
	CancelBatch(ctx context.Context, id string) error

	// ========== Extension Points ==========
	Repair(ctx context.Context, opts RepairOptions) (RepairResult, error)
	Upgrade(ctx context.Context, opts UpgradeOptions) (UpgradeResult, error)
}

// ========== Provider Registry ==========

// ProviderFactory is a function that creates an AI provider
type ProviderFactory func(config ProviderConfig) (AIProvider, error)

// ProviderRegistry manages all registered AI providers
type ProviderRegistry struct {
	factories  map[AIProviderType]ProviderFactory
	configs    map[AIProviderType]ProviderConfig
	providers  map[AIProviderType]AIProvider
	activeType AIProviderType
	mu         sync.RWMutex
}

// NewProviderRegistry creates a new provider registry
func NewProviderRegistry() *ProviderRegistry {
	return &ProviderRegistry{
		factories: make(map[AIProviderType]ProviderFactory),
		configs:   make(map[AIProviderType]ProviderConfig),
		providers: make(map[AIProviderType]AIProvider),
	}
}

// RegisterFactory registers a provider factory
func (r *ProviderRegistry) RegisterFactory(t AIProviderType, factory ProviderFactory) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.factories[t] = factory
}

// RegisterProvider registers a provider instance
func (r *ProviderRegistry) RegisterProvider(t AIProviderType, p AIProvider) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.providers[t] = p
}

// RegisterConfig registers a provider configuration
func (r *ProviderRegistry) RegisterConfig(t AIProviderType, config ProviderConfig) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.configs[t] = config
}

// GetProvider returns a provider by type
func (r *ProviderRegistry) GetProvider(t AIProviderType) (AIProvider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.providers[t]
	return p, ok
}

// GetConfig returns a provider configuration
func (r *ProviderRegistry) GetConfig(t AIProviderType) (ProviderConfig, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	c, ok := r.configs[t]
	return c, ok
}

// ListProviders returns all registered providers
func (r *ProviderRegistry) ListProviders() []AIProviderType {
	r.mu.RLock()
	defer r.mu.RUnlock()
	types := make([]AIProviderType, 0, len(r.providers))
	for t := range r.providers {
		types = append(types, t)
	}
	return types
}

// ListFactories returns all registered factories
func (r *ProviderRegistry) ListFactories() []AIProviderType {
	r.mu.RLock()
	defer r.mu.RUnlock()
	types := make([]AIProviderType, 0, len(r.factories))
	for t := range r.factories {
		types = append(types, t)
	}
	return types
}

// SetActive sets the active provider
func (r *ProviderRegistry) SetActive(t AIProviderType) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.providers[t]; !ok {
		return ErrProviderNotFound
	}
	r.activeType = t
	return nil
}

// GetActive returns the active provider
func (r *ProviderRegistry) GetActive() (AIProvider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if r.activeType == "" {
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
	providers := make([]AIProvider, 0, len(r.providers))
	for _, p := range r.providers {
		providers = append(providers, p)
	}
	r.mu.RUnlock()

	var lastErr error
	for _, p := range providers {
		if err := p.Initialize(ctx); err != nil {
			lastErr = err
		}
	}
	return lastErr
}

// HealthCheckAll runs health checks on all providers
func (r *ProviderRegistry) HealthCheckAll(ctx context.Context) map[AIProviderType]error {
	r.mu.RLock()
	providers := make(map[AIProviderType]AIProvider)
	for t, p := range r.providers {
		providers[t] = p
	}
	r.mu.RUnlock()

	results := make(map[AIProviderType]error)
	for t, p := range providers {
		results[t] = p.HealthCheck(ctx)
	}
	return results
}

// ErrProviderNotFound is returned when a provider is not found
var ErrProviderNotFound = &ProviderError{Code: "PROVIDER_NOT_FOUND", Message: "provider not found"}

// ProviderError represents a provider error
type ProviderError struct {
	Code    string
	Message string
	Err     error
}

func (e *ProviderError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *ProviderError) Unwrap() error {
	return e.Err
}
