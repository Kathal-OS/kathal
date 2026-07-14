// Package ai defines the core AI Runtime interfaces for KATHAL OS
// This is the AI Operating System layer - all AI operations flow through here.
package ai

import (
	"io"
	"time"
)

// ========== Provider Types ==========

// AIProviderType represents the type of AI provider
type AIProviderType string

const (
	AIProviderOpenRouter   AIProviderType = "openrouter"
	AIProviderGitHubModels AIProviderType = "github_models"
	AIProviderGemini       AIProviderType = "gemini"
	AIProviderOpenAI       AIProviderType = "openai"
	AIProviderAnthropic    AIProviderType = "anthropic"
	AIProviderGroq         AIProviderType = "groq"
	AIProviderLiteLLM      AIProviderType = "litellm"
	AIProviderOllama       AIProviderType = "ollama"
	AIProviderLMStudio     AIProviderType = "lm_studio"
	AIProviderCustom       AIProviderType = "custom"
)

// AIModelType represents the type of AI model
type AIModelType string

const (
	ModelTypeChat        AIModelType = "chat"
	ModelTypeCompletion  AIModelType = "completion"
	ModelTypeEmbedding   AIModelType = "embedding"
	ModelTypeImage       AIModelType = "image"
	ModelTypeAudio       AIModelType = "audio"
	ModelTypeVision      AIModelType = "vision"
	ModelTypeReasoning   AIModelType = "reasoning"
	ModelTypeToolCalling AIModelType = "tool_calling"
)

// AIModel represents an AI model
type AIModel struct {
	ID                string         `json:"id"`
	Name              string         `json:"name"`
	Provider          AIProviderType `json:"provider"`
	Type              AIModelType    `json:"type"`
	Description       string         `json:"description"`
	ContextWindow     int            `json:"context_window"`
	MaxTokens         int            `json:"max_tokens"`
	SupportsTools     bool           `json:"supports_tools"`
	SupportsVision    bool           `json:"supports_vision"`
	SupportsStreaming bool           `json:"supports_streaming"`
	Capabilities      []string       `json:"capabilities"`
	Pricing           *ModelPricing  `json:"pricing,omitempty"`
	Deprecated        bool           `json:"deprecated"`
}

// ModelPricing represents model pricing
type ModelPricing struct {
	InputPer1M  float64 `json:"input_per_1m"`
	OutputPer1M float64 `json:"output_per_1m"`
	CachePer1M  float64 `json:"cache_per_1m,omitempty"`
}

// ========== Core Message Types ==========

// AIMessage represents a message in a conversation
type AIMessage struct {
	Role         string         `json:"role"` // system, user, assistant, tool
	Content      string         `json:"content"`
	Name         string         `json:"name,omitempty"`
	ToolCalls    []ToolCall     `json:"tool_calls,omitempty"`
	ToolCallID   string         `json:"tool_call_id,omitempty"`
	Images       []ImageContent `json:"images,omitempty"`
	Audio        *AudioContent  `json:"audio,omitempty"`
	CacheControl *CacheControl  `json:"cache_control,omitempty"`
	Metadata     map[string]any `json:"metadata,omitempty"`
	Timestamp    time.Time      `json:"timestamp"`
}

// ImageContent represents image content
type ImageContent struct {
	Type   string `json:"type"` // url, base64
	URL    string `json:"url,omitempty"`
	Base64 string `json:"base64,omitempty"`
	Detail string `json:"detail,omitempty"` // low, high, auto
}

// AudioContent represents audio content
type AudioContent struct {
	Type   string `json:"type"`
	URL    string `json:"url,omitempty"`
	Base64 string `json:"base64,omitempty"`
	Format string `json:"format,omitempty"`
}

// ToolCall represents a tool call
type ToolCall struct {
	ID       string       `json:"id"`
	Type     string       `json:"type"` // function
	Function FunctionCall `json:"function"`
}

// FunctionCall represents a function call
type FunctionCall struct {
	Name      string         `json:"name"`
	Arguments map[string]any `json:"arguments"`
}

// ToolResult represents a tool execution result
type ToolResult struct {
	ToolCallID string         `json:"tool_call_id"`
	Output     string         `json:"output"`
	Error      string         `json:"error,omitempty"`
	Metadata   map[string]any `json:"metadata,omitempty"`
}

// ========== Request/Response Types ==========

// ChatCompletionRequest represents a chat completion request
type ChatCompletionRequest struct {
	Model            string          `json:"model"`
	Messages         []ChatMessage   `json:"messages"`
	Temperature      float64         `json:"temperature,omitempty"`
	TopP             float64         `json:"top_p,omitempty"`
	TopK             int             `json:"top_k,omitempty"`
	MaxTokens        int             `json:"max_tokens,omitempty"`
	MinTokens        int             `json:"min_tokens,omitempty"`
	Stream           bool            `json:"stream,omitempty"`
	Stop             []string        `json:"stop,omitempty"`
	PresencePenalty  float64         `json:"presence_penalty,omitempty"`
	FrequencyPenalty float64         `json:"frequency_penalty,omitempty"`
	LogitBias        map[string]int  `json:"logit_bias,omitempty"`
	User             string          `json:"user,omitempty"`
	Tools            []Tool          `json:"tools,omitempty"`
	ToolChoice       ToolChoice      `json:"tool_choice,omitempty"`
	ResponseFormat   *ResponseFormat `json:"response_format,omitempty"`
	Seed             int64           `json:"seed,omitempty"`
	LogProbs         bool            `json:"log_probs,omitempty"`
	TopLogProbs      int             `json:"top_log_probs,omitempty"`
	ExtraParams      map[string]any  `json:"-"`
}

// ChatMessage represents a chat message
type ChatMessage struct {
	Role         string         `json:"role"` // system, user, assistant, tool
	Content      string         `json:"content"`
	Name         string         `json:"name,omitempty"`
	ToolCalls    []ToolCall     `json:"tool_calls,omitempty"`
	ToolCallID   string         `json:"tool_call_id,omitempty"`
	Images       []ImageContent `json:"images,omitempty"`
	Audio        *AudioContent  `json:"audio,omitempty"`
	CacheControl *CacheControl  `json:"cache_control,omitempty"`
	Metadata     map[string]any `json:"metadata,omitempty"`
	Timestamp    time.Time      `json:"timestamp"`
}

// Tool represents a function tool
type Tool struct {
	Type     string       `json:"type"` // function
	Function FunctionSpec `json:"function"`
}

// FunctionSpec represents a function specification
type FunctionSpec struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Parameters  Schema `json:"parameters"`
	Strict      bool   `json:"strict,omitempty"`
}

// Schema represents a JSON schema
type Schema struct {
	Type       string            `json:"type"`
	Properties map[string]Schema `json:"properties,omitempty"`
	Required   []string          `json:"required,omitempty"`
	Items      *Schema           `json:"items,omitempty"`
	Enum       []string          `json:"enum,omitempty"`
	Format     string            `json:"format,omitempty"`
	Default    any               `json:"default,omitempty"`
}

// ToolChoice represents tool choice configuration
type ToolChoice struct {
	Type     string `json:"type"` // none, auto, required, function
	Function *struct {
		Name string `json:"name"`
	} `json:"function,omitempty"`
}

// ResponseFormat represents response format
type ResponseFormat struct {
	Type       string      `json:"type"` // text, json_object, json_schema
	JSONSchema *JSONSchema `json:"json_schema,omitempty"`
}

// JSONSchema represents a JSON schema
type JSONSchema struct {
	Name   string         `json:"name"`
	Schema map[string]any `json:"schema"`
	Strict bool           `json:"strict,omitempty"`
}

// CacheControl represents cache control
type CacheControl struct {
	Type string `json:"type"` // ephemeral
}

// ChatCompletionResponse represents a chat completion response
type ChatCompletionResponse struct {
	ID                string         `json:"id"`
	Object            string         `json:"object"` // chat.completion
	Created           int64          `json:"created"`
	Model             string         `json:"model"`
	SystemFingerprint string         `json:"system_fingerprint,omitempty"`
	Choices           []ChatChoice   `json:"choices"`
	Usage             Usage          `json:"usage"`
	Provider          AIProviderType `json:"-"`
}

// ChatChoice represents a chat choice
type ChatChoice struct {
	Index        int         `json:"index"`
	Message      ChatMessage `json:"message"`
	FinishReason string      `json:"finish_reason"` // stop, length, tool_calls, content_filter
	LogProbs     *LogProbs   `json:"logprobs,omitempty"`
}

// ChatCompletionChunk represents a streaming chunk
type ChatCompletionChunk struct {
	ID                string         `json:"id"`
	Object            string         `json:"object"` // chat.completion.chunk
	Created           int64          `json:"created"`
	Model             string         `json:"model"`
	SystemFingerprint string         `json:"system_fingerprint,omitempty"`
	Choices           []ChatDelta    `json:"choices"`
	Usage             *Usage         `json:"usage,omitempty"`
	Provider          AIProviderType `json:"-"`
}

// ChatDelta represents a streaming delta
type ChatDelta struct {
	Index        int         `json:"index"`
	Delta        ChatMessage `json:"delta"`
	FinishReason string      `json:"finish_reason,omitempty"`
	LogProbs     *LogProbs   `json:"logprobs,omitempty"`
}

// LogProbs represents log probabilities
type LogProbs struct {
	Content []TokenLogProb `json:"content"`
}

// TokenLogProb represents a token log probability
type TokenLogProb struct {
	Token       string       `json:"token"`
	LogProb     float64      `json:"logprob"`
	Bytes       []int        `json:"bytes,omitempty"`
	TopLogProbs []TopLogProb `json:"top_logprobs,omitempty"`
}

// TopLogProb represents a top log probability
type TopLogProb struct {
	Token   string  `json:"token"`
	LogProb float64 `json:"logprob"`
	Bytes   []int   `json:"bytes,omitempty"`
}

// Usage represents token usage
type Usage struct {
	PromptTokens            int                      `json:"prompt_tokens"`
	CompletionTokens        int                      `json:"completion_tokens"`
	TotalTokens             int                      `json:"total_tokens"`
	CacheTokens             int                      `json:"cache_tokens,omitempty"`
	PromptTokensDetails     *PromptTokensDetails     `json:"prompt_tokens_details,omitempty"`
	CompletionTokensDetails *CompletionTokensDetails `json:"completion_tokens_details,omitempty"`
}

// PromptTokensDetails represents prompt tokens details
type PromptTokensDetails struct {
	CachedTokens int `json:"cached_tokens"`
	AudioTokens  int `json:"audio_tokens"`
}

// CompletionTokensDetails represents completion tokens details
type CompletionTokensDetails struct {
	ReasoningTokens int `json:"reasoning_tokens"`
	AudioTokens     int `json:"audio_tokens"`
}

// ========== Completion Types (Legacy) ==========

// CompletionRequest represents a completion request (legacy)
type CompletionRequest struct {
	Model            string         `json:"model"`
	Prompt           string         `json:"prompt"`
	Suffix           string         `json:"suffix,omitempty"`
	MaxTokens        int            `json:"max_tokens,omitempty"`
	Temperature      float64        `json:"temperature,omitempty"`
	TopP             float64        `json:"top_p,omitempty"`
	TopK             int            `json:"top_k,omitempty"`
	Stream           bool           `json:"stream,omitempty"`
	Stop             []string       `json:"stop,omitempty"`
	PresencePenalty  float64        `json:"presence_penalty,omitempty"`
	FrequencyPenalty float64        `json:"frequency_penalty,omitempty"`
	LogProbs         int            `json:"log_probs,omitempty"`
	Echo             bool           `json:"echo,omitempty"`
	User             string         `json:"user,omitempty"`
	ExtraParams      map[string]any `json:"-"`
}

// CompletionResponse represents a completion response
type CompletionResponse struct {
	ID       string             `json:"id"`
	Object   string             `json:"object"` // text_completion
	Created  int64              `json:"created"`
	Model    string             `json:"model"`
	Choices  []CompletionChoice `json:"choices"`
	Usage    Usage              `json:"usage"`
	Provider AIProviderType     `json:"-"`
}

// CompletionChoice represents a completion choice
type CompletionChoice struct {
	Text         string    `json:"text"`
	Index        int       `json:"index"`
	FinishReason string    `json:"finish_reason"`
	LogProbs     *LogProbs `json:"logprobs,omitempty"`
}

// CompletionChunk represents a streaming completion chunk
type CompletionChunk struct {
	ID      string            `json:"id"`
	Object  string            `json:"object"` // text_completion.chunk
	Created int64             `json:"created"`
	Model   string            `json:"model"`
	Choices []CompletionDelta `json:"choices"`
	Usage   *Usage            `json:"usage,omitempty"`
}

// CompletionDelta represents a completion delta
type CompletionDelta struct {
	Text         string    `json:"text"`
	Index        int       `json:"index"`
	FinishReason string    `json:"finish_reason,omitempty"`
	LogProbs     *LogProbs `json:"logprobs,omitempty"`
}

// EmbeddingRequest represents an embedding request
type EmbeddingRequest struct {
	Input          any            `json:"input"` // string or []string
	Model          string         `json:"model"`
	EncodingFormat string         `json:"encoding_format,omitempty"` // float, base64
	Dimensions     int            `json:"dimensions,omitempty"`
	User           string         `json:"user,omitempty"`
	ExtraParams    map[string]any `json:"-"`
}

// EmbeddingResponse represents an embedding response
type EmbeddingResponse struct {
	Object   string          `json:"object"` // list
	Data     []EmbeddingData `json:"data"`
	Model    string          `json:"model"`
	Usage    Usage           `json:"usage"`
	Provider AIProviderType  `json:"-"`
}

// EmbeddingData represents embedding data
type EmbeddingData struct {
	Object    string    `json:"object"` // embedding
	Embedding []float64 `json:"embedding"`
	Index     int       `json:"index"`
}

// ImageGenerationRequest represents an image generation request
type ImageGenerationRequest struct {
	Prompt         string         `json:"prompt"`
	Model          string         `json:"model,omitempty"`
	N              int            `json:"n,omitempty"`
	Size           string         `json:"size,omitempty"`            // 1024x1024, 1792x1024, 1024x1792
	Quality        string         `json:"quality,omitempty"`         // standard, hd
	Style          string         `json:"style,omitempty"`           // vivid, natural
	ResponseFormat string         `json:"response_format,omitempty"` // url, b64_json
	User           string         `json:"user,omitempty"`
	ExtraParams    map[string]any `json:"-"`
}

// ImageGenerationResponse represents an image generation response
type ImageGenerationResponse struct {
	Created  int64          `json:"created"`
	Data     []ImageData    `json:"data"`
	Provider AIProviderType `json:"-"`
}

// ImageData represents image data
type ImageData struct {
	URL           string `json:"url,omitempty"`
	B64JSON       string `json:"b64_json,omitempty"`
	RevisedPrompt string `json:"revised_prompt,omitempty"`
}

// ImageEditRequest represents an image edit request
type ImageEditRequest struct {
	Image          io.Reader `json:"-"`
	ImagePath      string    `json:"-"`
	Mask           io.Reader `json:"-"`
	MaskPath       string    `json:"-"`
	Prompt         string    `json:"prompt"`
	Model          string    `json:"model,omitempty"`
	N              int       `json:"n,omitempty"`
	Size           string    `json:"size,omitempty"`
	ResponseFormat string    `json:"response_format,omitempty"`
	User           string    `json:"user,omitempty"`
}

// ImageVariationRequest represents an image variation request
type ImageVariationRequest struct {
	Image          io.Reader `json:"-"`
	ImagePath      string    `json:"-"`
	Model          string    `json:"model,omitempty"`
	N              int       `json:"n,omitempty"`
	Size           string    `json:"size,omitempty"`
	ResponseFormat string    `json:"response_format,omitempty"`
	User           string    `json:"user,omitempty"`
}

// AudioTranscriptionRequest represents audio transcription request
type AudioTranscriptionRequest struct {
	File                   io.Reader      `json:"-"`
	FilePath               string         `json:"-"`
	Model                  string         `json:"model"`
	Language               string         `json:"language,omitempty"`
	Prompt                 string         `json:"prompt,omitempty"`
	ResponseFormat         string         `json:"response_format,omitempty"` // json, text, srt, verbose_json, vtt
	Temperature            float64        `json:"temperature,omitempty"`
	TimestampGranularities []string       `json:"timestamp_granularities,omitempty"` // word, segment
	ExtraParams            map[string]any `json:"-"`
}

// AudioTranslationRequest represents audio translation request
type AudioTranslationRequest struct {
	File           io.Reader      `json:"-"`
	FilePath       string         `json:"-"`
	Model          string         `json:"model"`
	Prompt         string         `json:"prompt,omitempty"`
	ResponseFormat string         `json:"response_format,omitempty"`
	Temperature    float64        `json:"temperature,omitempty"`
	ExtraParams    map[string]any `json:"-"`
}

// SpeechRequest represents text-to-speech request
type SpeechRequest struct {
	Model          string         `json:"model"`
	Input          string         `json:"input"`
	Voice          string         `json:"voice"`
	ResponseFormat string         `json:"response_format,omitempty"` // mp3, opus, aac, flac
	Speed          float64        `json:"speed,omitempty"`           // 0.25 to 4.0
	ExtraParams    map[string]any `json:"-"`
}

// ModerationRequest represents a moderation request
type ModerationRequest struct {
	Input []string `json:"input"`
	Model string   `json:"model,omitempty"`
}

// ModerationResponse represents a moderation response
type ModerationResponse struct {
	ID       string             `json:"id"`
	Object   string             `json:"object"` // list
	Model    string             `json:"model"`
	Results  []ModerationResult `json:"results"`
	Provider AIProviderType     `json:"-"`
}

// ModerationResult represents a moderation result
type ModerationResult struct {
	Flagged        bool                     `json:"flagged"`
	Categories     ModerationCategories     `json:"categories"`
	CategoryScores ModerationCategoryScores `json:"category_scores"`
}

// ModerationCategories represents moderation categories
type ModerationCategories struct {
	Hate                  bool `json:"hate"`
	HateThreatening       bool `json:"hate_threatening"`
	Harassment            bool `json:"harassment"`
	HarassmentThreatening bool `json:"harassment_threatening"`
	SelfHarm              bool `json:"self_harm"`
	SelfHarmIntent        bool `json:"self_harm_intent"`
	SelfHarmInstructions  bool `json:"self_harm_instructions"`
	Sexual                bool `json:"sexual"`
	SexualMinors          bool `json:"sexual_minors"`
	Violence              bool `json:"violence"`
	ViolenceGraphic       bool `json:"violence_graphic"`
	Illegal               bool `json:"illegal"`
	NonViolent            bool `json:"non_violent"`
}

// ModerationCategoryScores represents moderation category scores
type ModerationCategoryScores struct {
	Hate                  float64 `json:"hate"`
	HateThreatening       float64 `json:"hate_threatening"`
	Harassment            float64 `json:"harassment"`
	HarassmentThreatening float64 `json:"harassment_threatening"`
	SelfHarm              float64 `json:"self_harm"`
	SelfHarmIntent        float64 `json:"self_harm_intent"`
	SelfHarmInstructions  float64 `json:"self_harm_instructions"`
	Sexual                float64 `json:"sexual"`
	SexualMinors          float64 `json:"sexual_minors"`
	Violence              float64 `json:"violence"`
	ViolenceGraphic       float64 `json:"violence_graphic"`
	Illegal               float64 `json:"illegal"`
	NonViolent            float64 `json:"non_violent"`
}

// FineTuneRequest represents a fine-tune request
type FineTuneRequest struct {
	TrainingFile    string                  `json:"training_file"`
	ValidationFile  string                  `json:"validation_file,omitempty"`
	Model           string                  `json:"model"`
	Suffix          string                  `json:"suffix,omitempty"`
	Hyperparameters FineTuneHyperparameters `json:"hyperparameters,omitempty"`
	Integrations    []FineTuneIntegration   `json:"integrations,omitempty"`
	Seed            int                     `json:"seed,omitempty"`
}

// FineTuneHyperparameters represents fine-tune hyperparameters
type FineTuneHyperparameters struct {
	BatchSize              int     `json:"batch_size,omitempty"`
	LearningRateMultiplier float64 `json:"learning_rate_multiplier,omitempty"`
	NEpochs                int     `json:"n_epochs,omitempty"`
}

// FineTuneIntegration represents fine-tune integration
type FineTuneIntegration struct {
	Type   string         `json:"type"` // wandb, mlflow
	Config map[string]any `json:"config"`
}

// FineTuneJob represents a fine-tune job
type FineTuneJob struct {
	ID              string                  `json:"id"`
	Object          string                  `json:"object"` // fine_tune.job
	Model           string                  `json:"model"`
	CreatedAt       int64                   `json:"created_at"`
	FinishedAt      int64                   `json:"finished_at,omitempty"`
	Status          string                  `json:"status"` // validating_files, queued, running, succeeded, failed, cancelled
	TrainingFile    string                  `json:"training_file"`
	ValidationFile  string                  `json:"validation_file,omitempty"`
	ResultFiles     []string                `json:"result_files,omitempty"`
	FineTunedModel  string                  `json:"fine_tuned_model,omitempty"`
	Hyperparameters FineTuneHyperparameters `json:"hyperparameters"`
	Error           *FineTuneError          `json:"error,omitempty"`
}

// FineTuneError represents a fine-tune error
type FineTuneError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Param   string `json:"param,omitempty"`
}

// BatchRequest represents a batch request
type BatchRequest struct {
	InputFileID      string            `json:"input_file_id"`
	Endpoint         string            `json:"endpoint"`          // /v1/chat/completions, /v1/embeddings, /v1/completions
	CompletionWindow string            `json:"completion_window"` // 24h
	Metadata         map[string]string `json:"metadata,omitempty"`
}

// BatchJob represents a batch job
type BatchJob struct {
	ID               string             `json:"id"`
	Object           string             `json:"object"` // batch
	Endpoint         string             `json:"endpoint"`
	Errors           *BatchErrors       `json:"errors,omitempty"`
	InputFileID      string             `json:"input_file_id"`
	CompletionWindow string             `json:"completion_window"`
	Status           string             `json:"status"` // validating, failed, in_progress, finalizing, completed, expired, cancelling, cancelled
	OutputFileID     string             `json:"output_file_id,omitempty"`
	ErrorFileID      string             `json:"error_file_id,omitempty"`
	CreatedAt        int64              `json:"created_at"`
	InProgressAt     int64              `json:"in_progress_at,omitempty"`
	ExpiresAt        int64              `json:"expires_at,omitempty"`
	FinalizingAt     int64              `json:"finalizing_at,omitempty"`
	CompletedAt      int64              `json:"completed_at,omitempty"`
	FailedAt         int64              `json:"failed_at,omitempty"`
	ExpiredAt        int64              `json:"expired_at,omitempty"`
	CancelledAt      int64              `json:"cancelled_at,omitempty"`
	RequestCounts    BatchRequestCounts `json:"request_counts"`
	Metadata         map[string]string  `json:"metadata,omitempty"`
}

// BatchErrors represents batch errors
type BatchErrors struct {
	Object string       `json:"object"` // list
	Data   []BatchError `json:"data"`
}

// BatchError represents a batch error
type BatchError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Param   string `json:"param,omitempty"`
	Line    int    `json:"line,omitempty"`
}

// BatchRequestCounts represents batch request counts
type BatchRequestCounts struct {
	Total     int `json:"total"`
	Completed int `json:"completed"`
	Failed    int `json:"failed"`
}

// ListOptions represents list options
type ListOptions struct {
	Limit  int    `json:"limit,omitempty"`
	After  string `json:"after,omitempty"`
	Before string `json:"before,omitempty"`
}

// RepairOptions represents repair options
type RepairOptions struct {
	Component string `json:"component"`
	Force     bool   `json:"force"`
	DryRun    bool   `json:"dry_run"`
}

// RepairResult represents repair result
type RepairResult struct {
	Component   string `json:"component"`
	Action      string `json:"action"`
	Description string `json:"description"`
	Success     bool   `json:"success"`
	Error       string `json:"error,omitempty"`
	Timestamp   int64  `json:"timestamp"`
}

// UpgradeOptions represents upgrade options
type UpgradeOptions struct {
	Version         string `json:"version"`
	CheckOnly       bool   `json:"check_only"`
	BackupBefore    bool   `json:"backup_before"`
	Force           bool   `json:"force"`
	RollbackOnError bool   `json:"rollback_on_error"`
}

// UpgradeResult represents upgrade result
type UpgradeResult struct {
	FromVersion   string `json:"from_version"`
	ToVersion     string `json:"to_version"`
	LatestVersion string `json:"latest_version"`
	Status        string `json:"status"`
	Error         string `json:"error,omitempty"`
	Changelog     string `json:"changelog,omitempty"`
}

// AudioResponse represents audio transcription/translation response
type AudioResponse struct {
	Text     string  `json:"text"`
	Language string  `json:"language,omitempty"`
	Duration float64 `json:"duration,omitempty"`
}

// ========== Provider Config Types ==========

// ProviderConfig holds configuration for a provider
type ProviderConfig struct {
	Name         string            `json:"name"`
	Type         AIProviderType    `json:"type"`
	Enabled      bool              `json:"enabled"`
	Priority     int               `json:"priority"`
	APIKey       string            `json:"api_key,omitempty"`
	BaseURL      string            `json:"base_url,omitempty"`
	Organization string            `json:"organization,omitempty"`
	Headers      map[string]string `json:"headers,omitempty"`
	Timeout      time.Duration     `json:"timeout,omitempty"`
	MaxRetries   int               `json:"max_retries,omitempty"`
	RateLimits   *RateLimits       `json:"rate_limits,omitempty"`
	Models       []string          `json:"models,omitempty"`
	ExtraConfig  map[string]any    `json:"extra_config,omitempty"`
}

// RateLimits represents rate limits
type RateLimits struct {
	RequestsPerMinute  int `json:"requests_per_minute"`
	TokensPerMinute    int `json:"tokens_per_minute"`
	ConcurrentRequests int `json:"concurrent_requests"`
}

// ProviderCapabilities represents provider capabilities
type ProviderCapabilities struct {
	Chat        bool `json:"chat"`
	Completion  bool `json:"completion"`
	Embedding   bool `json:"embedding"`
	Image       bool `json:"image"`
	Audio       bool `json:"audio"`
	Vision      bool `json:"vision"`
	ToolCalling bool `json:"tool_calling"`
	Streaming   bool `json:"streaming"`
	Batching    bool `json:"batching"`
	FineTuning  bool `json:"fine_tuning"`
	Moderation  bool `json:"moderation"`
}

// ProviderStatus represents provider status
type ProviderStatus string

const (
	ProviderStatusUnknown     ProviderStatus = "unknown"
	ProviderStatusStarting    ProviderStatus = "starting"
	ProviderStatusRunning     ProviderStatus = "running"
	ProviderStatusStopping    ProviderStatus = "stopping"
	ProviderStatusStopped     ProviderStatus = "stopped"
	ProviderStatusError       ProviderStatus = "error"
	ProviderStatusDegraded    ProviderStatus = "degraded"
	ProviderStatusRateLimited ProviderStatus = "rate_limited"
)

// ========== Router Config Types ==========

// ModelRouterConfig represents model router configuration
type ModelRouterConfig struct {
	Strategy          string            `json:"strategy"` // auto, manual, cost_optimized, quality_optimized
	FallbackModels    map[string]string `json:"fallback_models"`
	TaskModels        map[string]string `json:"task_models"`
	CostOptimization  bool              `json:"cost_optimization"`
	QualityThreshold  float64           `json:"quality_threshold"`
	MaxCostPerRequest float64           `json:"max_cost_per_request"`
}

// SessionConfig represents session configuration
type SessionConfig struct {
	MaxHistory       int           `json:"max_history"`
	MaxTokens        int           `json:"max_tokens"`
	CompressionRatio float64       `json:"compression_ratio"`
	AutoSummarize    bool          `json:"auto_summarize"`
	TTL              time.Duration `json:"ttl"`
	MemoryEnabled    bool          `json:"memory_enabled"`
}
