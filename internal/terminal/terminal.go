// Package terminal provides a WebSocket-based terminal (xterm.js frontend, PTY backend).
package terminal

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Message types for WebSocket communication.
const (
	msgTypeInput  = "input"
	msgTypeResize = "resize"
)

// incomingMessage is the JSON envelope received from the xterm.js client.
type incomingMessage struct {
	Type string `json:"type"`
	Data string `json:"data,omitempty"` // raw terminal input
	Cols uint16 `json:"cols,omitempty"`
	Rows uint16 `json:"rows,omitempty"`
}

// ptyProcess abstracts the platform-specific PTY/cmd process.
type ptyProcess interface {
	write(data []byte) (int, error)
	read(buf []byte) (int, error)
	resize(cols, rows uint16) error
	close() error
}

// Session represents a single terminal session backed by a PTY process.
type Session struct {
	ID         string    `json:"id"`
	CreatedAt  time.Time `json:"createdAt"`
	LastActive time.Time `json:"lastActive"`
	Cols       uint16    `json:"cols"`
	Rows       uint16    `json:"rows"`

	proc   ptyProcess
	mu     sync.Mutex
	closed bool
}

// Manager manages terminal sessions.
type Manager struct {
	sessions map[string]*Session
	mu       sync.RWMutex
}

// NewManager creates a new terminal session manager.
func NewManager() *Manager {
	return &Manager{
		sessions: make(map[string]*Session),
	}
}

// CreateSession spawns a PTY-backed shell process and registers it.
// cols/rows set the initial terminal dimensions.
func (m *Manager) CreateSession(id string, cols, rows uint16) (*Session, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.sessions[id]; exists {
		return nil, fmt.Errorf("session %s already exists", id)
	}

	proc, err := newPTY(cols, rows)
	if err != nil {
		return nil, fmt.Errorf("start session %s: %w", id, err)
	}

	s := &Session{
		ID:        id,
		CreatedAt: time.Now(),
		Cols:      cols,
		Rows:      rows,
		proc:      proc,
	}

	m.sessions[id] = s
	return s, nil
}

// CloseSession tears down the PTY and removes the session.
func (m *Manager) CloseSession(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	s, ok := m.sessions[id]
	if !ok {
		return fmt.Errorf("session %s not found", id)
	}

	err := s.proc.close()
	delete(m.sessions, id)
	return err
}

// HandleWebSocket upgrades the HTTP request to a WebSocket and bridges
// it to the PTY session identified by sessionID.
func (m *Manager) HandleWebSocket(w http.ResponseWriter, r *http.Request, sessionID string) {
	m.mu.RLock()
	s, ok := m.sessions[sessionID]
	m.mu.RUnlock()

	if !ok {
		http.Error(w, fmt.Sprintf("session %s not found", sessionID), http.StatusNotFound)
		return
	}

	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, fmt.Sprintf("websocket upgrade failed: %v", err), http.StatusInternalServerError)
		return
	}
	defer ws.Close()

	// Mark session active.
	s.mu.Lock()
	s.LastActive = time.Now()
	s.mu.Unlock()

	// Pipe PTY stdout -> WebSocket.
	go func() {
		buf := make([]byte, 4096)
		for {
			n, err := s.proc.read(buf)
			if n > 0 {
				if writeErr := ws.WriteMessage(websocket.TextMessage, buf[:n]); writeErr != nil {
					return
				}
			}
			if err != nil {
				if err != io.EOF {
					_ = ws.WriteMessage(websocket.CloseMessage,
						websocket.FormatCloseMessage(websocket.CloseNormalClosure, "pty closed"))
				}
				return
			}
		}
	}()

	// Read WebSocket messages -> PTY stdin.
	for {
		_, raw, err := ws.ReadMessage()
		if err != nil {
			// Client disconnected or error — clean up.
			return
		}

		s.mu.Lock()
		s.LastActive = time.Now()
		s.mu.Unlock()

		var msg incomingMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			// If it's not valid JSON, treat the whole thing as raw input.
			if _, wErr := s.proc.write(raw); wErr != nil {
				return
			}
			continue
		}

		switch msg.Type {
		case msgTypeResize:
			if err := s.proc.resize(msg.Cols, msg.Rows); err != nil {
				_ = ws.WriteMessage(websocket.TextMessage,
					[]byte(fmt.Sprintf(`{"error":"%s"}`, err)))
			}
		case msgTypeInput:
			if _, err := s.proc.write([]byte(msg.Data)); err != nil {
				return
			}
		default:
			// Unknown message type — try raw write.
			if _, err := s.proc.write(raw); err != nil {
				return
			}
		}
	}
}

// GetSession returns the session by ID (read-only access).
func (m *Manager) GetSession(id string) (*Session, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.sessions[id]
	return s, ok
}

// Len returns the number of active sessions.
func (m *Manager) Len() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.sessions)
}
