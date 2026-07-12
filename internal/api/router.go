// Package api provides the REST API for the KATHAL OS dashboard.
package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/bakeweb/kathal-os/internal/auth"
	"github.com/bakeweb/kathal-os/internal/config"
	"github.com/bakeweb/kathal-os/internal/docker"
	"github.com/bakeweb/kathal-os/internal/metrics"
	"github.com/bakeweb/kathal-os/internal/store"
	"github.com/gorilla/mux"
)

// Deps holds all dependencies for the API.
type Deps struct {
	Config  *config.Config
	Store   *store.DB
	Docker  *docker.Client
	Metrics *metrics.Collector
	JWT     *auth.JWT
}

// NewRouter creates the main HTTP router.
func NewRouter(deps Deps) http.Handler {
	r := mux.NewRouter()

	// API v1.
	api := r.PathPrefix("/api/v1").Subrouter()

	// Dashboard metrics.
	api.HandleFunc("/metrics", handleMetrics(deps)).Methods("GET")
	api.HandleFunc("/system", handleSystemInfo(deps)).Methods("GET")

	// Docker containers.
	api.HandleFunc("/containers", handleListContainers(deps)).Methods("GET")
	api.HandleFunc("/containers/{id}/start", handleStartContainer(deps)).Methods("POST")
	api.HandleFunc("/containers/{id}/stop", handleStopContainer(deps)).Methods("POST")
	api.HandleFunc("/containers/{id}/restart", handleRestartContainer(deps)).Methods("POST")
	api.HandleFunc("/containers/{id}/delete", handleDeleteContainer(deps)).Methods("DELETE")
	api.HandleFunc("/containers/{id}/logs", handleContainerLogs(deps)).Methods("GET")

	// Docker images.
	api.HandleFunc("/images", handleListImages(deps)).Methods("GET")

	// Apps (managed deployments).
	api.HandleFunc("/apps", handleListApps(deps)).Methods("GET")
	api.HandleFunc("/apps", handleCreateApp(deps)).Methods("POST")
	api.HandleFunc("/apps/{id}", handleGetApp(deps)).Methods("GET")
	api.HandleFunc("/apps/{id}", handleUpdateApp(deps)).Methods("PUT")
	api.HandleFunc("/apps/{id}", handleDeleteApp(deps)).Methods("DELETE")

	// Health.
	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]string{"status": "ok"})
	}).Methods("GET")

	// Login (public).
	api.HandleFunc("/login", handleLogin(deps)).Methods("POST")

	// Serve static files (React build) — catch-all for frontend routes.
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("web/dist")))

	return r
}

// --- Handlers ---

func handleMetrics(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		m, err := deps.Metrics.Collect()
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, m)
	}
}

func handleSystemInfo(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		info := map[string]interface{}{
			"version":    deps.Config.Version,
			"docker":     deps.Docker != nil && deps.Docker.IsAvailable(),
			"goVersion":  "go1.22",
		}
		writeJSON(w, info)
	}
}

func handleListContainers(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if deps.Docker == nil || !deps.Docker.IsAvailable() {
			writeJSON(w, []interface{}{})
			return
		}
		all := r.URL.Query().Get("all") == "true"
		containers, err := deps.Docker.ListContainers(r.Context(), all)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, containers)
	}
}

func handleStartContainer(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if err := deps.Docker.StartContainer(r.Context(), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, map[string]string{"status": "started"})
	}
}

func handleStopContainer(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if err := deps.Docker.StopContainer(r.Context(), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, map[string]string{"status": "stopped"})
	}
}

func handleRestartContainer(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if err := deps.Docker.RestartContainer(r.Context(), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, map[string]string{"status": "restarted"})
	}
}

func handleDeleteContainer(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if err := deps.Docker.RemoveContainer(r.Context(), id, true); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, map[string]string{"status": "deleted"})
	}
}

func handleContainerLogs(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		logs, err := deps.Docker.GetContainerLogs(r.Context(), id, 100)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, map[string]string{"logs": logs})
	}
}

func handleListImages(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if deps.Docker == nil || !deps.Docker.IsAvailable() {
			writeJSON(w, []interface{}{})
			return
		}
		images, err := deps.Docker.ListImages(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, images)
	}
}

func handleListApps(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apps, err := deps.Store.ListApps()
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, apps)
	}
}

func handleCreateApp(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var app store.App
		if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON")
			return
		}
		if err := deps.Store.CreateApp(&app); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, app)
	}
}

func handleGetApp(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		app, err := deps.Store.GetApp(id)
		if err != nil {
			writeError(w, http.StatusNotFound, "app not found")
			return
		}
		writeJSON(w, app)
	}
}

func handleUpdateApp(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		var app store.App
		if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON")
			return
		}
		app.ID = id
		if err := deps.Store.UpdateApp(&app); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, app)
	}
}

func handleDeleteApp(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if err := deps.Store.DeleteApp(id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, map[string]string{"status": "deleted"})
	}
}

// --- Login Handler ---

func handleLogin(deps Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON")
			return
		}

		// For now, accept any email with password "kathal" or the default admin.
		// In production, this should check the database.
		if req.Password != "kathal" && req.Password != "admin" {
			writeError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}

		email := req.Email
		if email == "" {
			email = "admin@kathal.local"
		}

		// Generate token.
		token, err := deps.JWT.GenerateToken("admin", email, "admin", 72*time.Hour)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to generate token")
			return
		}

		writeJSON(w, map[string]interface{}{
			"token": token,
			"user": map[string]string{
				"id":    "admin",
				"email": email,
				"role":  "admin",
			},
		})
	}
}

// --- Helpers ---

func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
