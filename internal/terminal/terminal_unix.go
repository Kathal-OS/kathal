//go:build !windows

package terminal

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/creack/pty"
)

// unixPTY wraps a real pseudo-terminal on Linux/macOS/BSD.
type unixPTY struct {
	ptmx *os.File
	cmd  *exec.Cmd
}

func newPTY(cols, rows uint16) (ptyProcess, error) {
	shell := "/bin/sh"
	// Prefer bash if available.
	if bash, err := exec.LookPath("bash"); err == nil {
		shell = bash
	}

	cmd := exec.Command(shell)
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	ptmx, err := pty.Start(cmd)
	if err != nil {
		return nil, fmt.Errorf("start pty: %w", err)
	}

	// Set initial size.
	if err := pty.Setsize(ptmx, &pty.Winsize{Rows: rows, Cols: cols}); err != nil {
		_ = ptmx.Close()
		_ = cmd.Process.Kill()
		return nil, fmt.Errorf("set pty size: %w", err)
	}

	return &unixPTY{ptmx: ptmx, cmd: cmd}, nil
}

func (u *unixPTY) write(data []byte) (int, error) {
	return u.ptmx.Write(data)
}

func (u *unixPTY) read(buf []byte) (int, error) {
	return u.ptmx.Read(buf)
}

func (u *unixPTY) resize(cols, rows uint16) error {
	return pty.Setsize(u.ptmx, &pty.Winsize{Rows: rows, Cols: cols})
}

func (u *unixPTY) close() error {
	if err := u.ptmx.Close(); err != nil {
		_ = u.cmd.Process.Kill()
		return err
	}
	return u.cmd.Process.Kill()
}
