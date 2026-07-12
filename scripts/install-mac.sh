#!/bin/bash
# KATHAL OS — macOS Installer
# Installs KATHAL dashboard on macOS.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/bakeweb/kathal-os/main/scripts/install-mac.sh | bash
#   Or: bash scripts/install-mac.sh

set -e

VERSION="0.1.0"
INSTALL_DIR="$HOME/.kathal"
DATA_DIR="$HOME/.kathal/data"
PORT=8080

echo ""
echo "  KATHAL OS Installer (macOS)"
echo "  ============================"
echo ""

# Detect architecture.
ARCH=$(uname -m)
case "$ARCH" in
  arm64) ARCH_NAME="arm64" ;;
  x86_64) ARCH_NAME="amd64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

echo "[1/5] Checking dependencies..."

# Check Docker (optional).
DOCKER_AVAILABLE=false
if command -v docker &>/dev/null; then
    DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null || true)
    if [ -n "$DOCKER_VERSION" ]; then
        DOCKER_AVAILABLE=true
        echo "  Docker found: v$DOCKER_VERSION"
    fi
fi

if [ "$DOCKER_AVAILABLE" = false ]; then
    echo "  Docker not found — running in system-only mode (Docker optional)"
fi

# Check Homebrew.
HAS_BREW=false
if command -v brew &>/dev/null; then
    HAS_BREW=true
    echo "  Homebrew found"
fi

echo ""
echo "[2/5] Downloading KATHAL v$VERSION..."

mkdir -p "$INSTALL_DIR" "$DATA_DIR"

# Try downloading pre-built binary.
DOWNLOAD_URL="https://github.com/bakeweb/kathal-os/releases/download/v$VERSION/kathal-$VERSION-darwin-$ARCH_NAME"
BINARY="$INSTALL_DIR/kathal"

if curl -fsSL -o "$BINARY" "$DOWNLOAD_URL" 2>/dev/null; then
    chmod +x "$BINARY"
    echo "  Downloaded pre-built binary"
else
    echo "  Pre-built binary not available, building from source..."

    if ! command -v go &>/dev/null; then
        if [ "$HAS_BREW" = true ]; then
            echo "  Installing Go via Homebrew..."
            brew install go
        else
            echo "  Go not found. Install from https://go.dev/dl/"
            exit 1
        fi
    fi

    TMPDIR=$(mktemp -d)
    cd "$TMPDIR"
    curl -fsSL "https://github.com/bakeweb/kathal-os/archive/refs/heads/main.tar.gz" | tar xz
    cd kathal-os-*
    go build -o "$BINARY" ./cmd/kathal
    cd /
    rm -rf "$TMPDIR"
    echo "  Built from source"
fi

echo ""
echo "[3/5] Creating launch agent..."

# Create launchd plist for auto-start.
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$PLIST_DIR/com.kathal.dashboard.plist"
mkdir -p "$PLIST_DIR"

cat > "$PLIST_FILE" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kathal.dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BINARY</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$INSTALL_DIR</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>KATHAL_HTTP_ADDR</key>
        <string>:$PORT</string>
        <key>KATHAL_DB_PATH</key>
        <string>$DATA_DIR/kathal.db</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$INSTALL_DIR/kathal.log</string>
    <key>StandardErrorPath</key>
    <string>$INSTALL_DIR/kathal.log</string>
</dict>
</plist>
PLIST

echo "  Launch agent created at $PLIST_FILE"

echo ""
echo "[4/5] Copying uninstall script..."
cat > "$INSTALL_DIR/uninstall.sh" << UNINSTALLEOF
#!/bin/bash
# KATHAL OS — macOS Uninstaller
echo "Stopping KATHAL..."
launchctl unload "$PLIST_FILE" 2>/dev/null || true
rm -f "$PLIST_FILE"
rm -rf "$INSTALL_DIR"
echo "KATHAL uninstalled."
UNINSTALLEOF
chmod +x "$INSTALL_DIR/uninstall.sh"

echo ""
echo "[5/5] Starting KATHAL..."

# Start the service.
launchctl unload "$PLIST_FILE" 2>/dev/null || true
launchctl load "$PLIST_FILE"

echo ""
echo "  KATHAL OS installed and running!"
echo ""
echo "  Dashboard: http://localhost:$PORT"
echo "  Login:     admin@kathal.local / kathal"
echo ""
echo "  Commands:"
echo "    Start:   launchctl load $PLIST_FILE"
echo "    Stop:    launchctl unload $PLIST_FILE"
echo "    Logs:    tail -f $INSTALL_DIR/kathal.log"
echo "    Uninstall: bash $INSTALL_DIR/uninstall.sh"
echo ""
