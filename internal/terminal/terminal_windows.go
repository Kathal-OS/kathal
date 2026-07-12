//go:build windows

package terminal

import (
	"fmt"
	"os"
	"os/exec"
)

// winPTY uses plain os/exec pipes on Windows.
// A real PTY on Windows would require Windows ConPTY; for now we use pipes
// which work for basic command execution but don't support full terminal
// emulation. For production, consider github.com/nicedoc/conpty.
type winPTY struct {
	stdin  *os.File
	stdout *os.File
	cmd    *exec.Cmd
}

func newPTY(cols, rows uint16) (ptyProcess, error) {
	cmd := exec.Command("cmd.exe")
	cmd.Env = append(os.Environ(), "TERM=xterm")

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		_ = stdin.Close()
		return nil, fmt.Errorf("stdout pipe: %w", err)
	}

	cmd.Stderr = cmd.Stdout // merge stderr into stdout

	if err := cmd.Start(); err != nil {
		_ = stdin.Close()
		_ = stdout.Close()
		return nil, fmt.Errorf("start cmd: %w", err)
	}

	// We need to cast pipes to *os.File for the read/write interface.
	// stdin and stdout are already *os.File-compatible; use the concrete types.
	stdinFile, ok := stdin.(*os.File)
	if !ok {
		_ = stdin.Close()
		_ = cmd.Process.Kill()
		return nil, fmt.Errorf("stdin is not *os.File")
	}

	return &winPTY{
		stdin:  stdinFile,
		stdout: stdout.(*os.File),
		cmd:    cmd,
	}, nil
}

func (w *winPTY) write(data []byte) (int, error) {
	return w.stdin.Write(data)
}

func (w *winPTY) read(buf []byte) (int, error) {
	return w.stdout.Read(buf)
}

func (w *winPTY) resize(cols, rows uint16) error {
	// Windows ConPTY resize is not yet implemented.
	// The basic pipe approach doesn't support resize.
	return nil
}

func (w *winPTY) close() error {
	_ = w.stdin.Close()
	_ = w.stdout.Close()
	return w.cmd.Process.Kill()
}
