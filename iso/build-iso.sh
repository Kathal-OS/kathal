#!/bin/bash
# KATHAL OS ISO Builder
# Creates a bootable Ubuntu ISO with KATHAL dashboard pre-installed.
# Run on a Debian/Ubuntu system with live-build installed.
#
# Prerequisites:
#   sudo apt-get install live-build debootstrap squashfs-tools
#
# Usage:
#   sudo bash build-iso.sh
#
# Output: kathal-os-*.iso in the current directory.

set -euo pipefail

KATHAL_VERSION="0.1.0"
ISO_NAME="kathal-os-${KATHAL_VERSION}-amd64"
WORK_DIR="$(pwd)/iso-work"
CONFIG_DIR="$(pwd)/iso/config"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[iso]${NC} $1"; }
step() { echo -e "${BLUE}[iso]${NC} $1"; }

# Check root.
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root: sudo bash build-iso.sh${NC}"
    exit 1
fi

# Check live-build.
if ! command -v lb &> /dev/null; then
    log "Installing live-build..."
    apt-get update -qq
    apt-get install -y -qq live-build debootstrap squashfs-tools
fi

echo -e "${BLUE}"
echo "  ╦ ╦╔═╗╔═╗╔╦╗╦╔═╗╔═╗╔═╗"
echo "  ╠═╣║╣ ╚═╗ ║ ║╠═╣║  ╚═╗"
echo "  ╩ ╩╚═╝╚═╝ ╩ ╩╩ ╩╚═╝╚═╝"
echo "  ISO Builder v${KATHAL_VERSION}"
echo -e "${NC}"

# Clean previous build.
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

cd "$WORK_DIR"

# Step 1: Configure live-build.
step "Step 1/6: Configuring live-build..."
mkdir -p config/package-lists
mkdir -p config/hooks/live
mkdir -p config/includes.chroot/opt/kathal
mkdir -p config/includes.chroot/etc/systemd/system

# Base config.
cat > config/config.common << EOF
LB_DISTRIBUTION="noble"
LB_ARCHITECTURES="amd64"
LB_BOOTLOADERS="grub-efi"
LB_BINARY_IMAGES="iso-hybrid"
LB_ISO_APPLICATION="KATHAL OS"
LB_ISO_PUBLISHER="KATHAL; https://github.com/bakeweb/kathal-os"
LB_ISO_VOLUME="KATHAL-${KATHAL_VERSION}"
LB_COMPRESSION="gzip"
EOF

# Step 2: Package list.
step "Step 2/6: Creating package list..."
cat > config/package-lists/kathal.list.chroot << 'EOF'
# System essentials
linux-image-amd64
sudo
curl
wget
git
ca-certificates
gnupg
lsb-release

# Dashboard dependencies
systemd
network-manager
openssh-server

# Utilities
htop
tmux
nano
vim-tiny
net-tools
iproute2
ufw
EOF

# Step 3: Auto-install hook (runs during live build).
step "Step 3/6: Creating install hooks..."
cat > config/hooks/live/0100-install-kathal.hook.chroot << 'HOOKEOF'
#!/bin/bash
set -euo pipefail

echo "[kathal-iso] Installing KATHAL dashboard..."

# Add default user.
useradd -m -s /bin/bash -G sudo kathal
echo "kathal:kathal" | chpasswd
echo "kathal ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/kathal

# Create data directory.
mkdir -p /opt/kathal/data

# Copy the binary if available from build context.
if [ -f /tmp/kathal-binary ]; then
    cp /tmp/kathal-binary /opt/kathal/kathal
    chmod +x /opt/kathal/kathal
fi

# Create systemd service — runs binary directly (Docker-optional).
cat > /etc/systemd/system/kathal.service << 'SERVICEEOF'
[Unit]
Description=KATHAL OS Dashboard
After=network.target

[Service]
Type=simple
ExecStart=/opt/kathal/kathal
WorkingDirectory=/opt/kathal
Restart=always
RestartSec=5
Environment=KATHAL_HTTP_ADDR=:8080
Environment=KATHAL_DB_PATH=/opt/kathal/data/kathal.db

# Security hardening.
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/opt/kathal/data

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl enable kathal.service

# Configure SSH.
systemctl enable ssh
sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# Set hostname.
echo "kathal-os" > /etc/hostname

# Auto-login on tty1 for first-time setup.
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << 'AUTOLOGINEOF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin kathal -o '-p -f kathal' %I \$TERM
AUTOLOGINEOF

# Welcome message on login.
cat > /etc/motd << 'MOTDEOF'

  ╦ ╦╔═╗╔═╗╔╦╗╦╔═╗╔═╗╔═╗
  ╠═╣║╣ ╚═╗ ║ ║╠═╣║  ╚═╗
  ╩ ╩╚═╝╚═╝ ╩ ╩╩ ╩╚═╝╚═╝

  Welcome to KATHAL OS!

  Dashboard: http://localhost:8080
  Default login: admin@kathal.local / kathal

  Quick commands:
    kathal-status  — Check dashboard status
    kathal-logs    — View dashboard logs
    kathal-update  — Update to latest version

MOTDEOF

echo "[kathal-iso] Installation complete."
HOOKEOF
chmod +x config/hooks/live/0100-install-kathal.hook.chroot

# Step 4: Copy KATHAL binary if available.
step "Step 4/6: Preparing KATHAL binary..."
KATHAL_BINARY="../kathal"
if [ -f "$KATHAL_BINARY" ]; then
    cp "$KATHAL_BINARY" config/includes.chroot/opt/kathal/kathal
    chmod +x config/includes.chroot/opt/kathal/kathal
    log "KATHAL binary included"
else
    # Check dist/ for release binary.
    RELEASE_BIN="../dist/kathal-${KATHAL_VERSION}-linux-amd64"
    if [ -f "$RELEASE_BIN" ]; then
        cp "$RELEASE_BIN" config/includes.chroot/opt/kathal/kathal
        chmod +x config/includes.chroot/opt/kathal/kathal
        log "KATHAL release binary included from dist/"
    else
        log "KATHAL binary not found — will need manual install after boot"
    fi
fi

# Step 5: Build ISO.
step "Step 5/6: Building ISO (this takes 10-20 minutes)..."
lb clean --purge 2>/dev/null || true
lb build 2>&1 | tail -5

# Step 6: Move output.
step "Step 6/6: Finalizing..."
ISO_FILE=$(ls -1 *.iso 2>/dev/null | head -1)
if [ -n "$ISO_FILE" ]; then
    mv "$ISO_FILE" "../${ISO_NAME}.iso"
    cd ..
    SIZE=$(du -h "${ISO_NAME}.iso" | cut -f1)
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║       ISO Build Complete!                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  File: ${BLUE}${ISO_NAME}.iso${NC}"
    echo -e "  Size: ${SIZE}"
    echo -e "  Arch: amd64"
    echo ""
    echo -e "  Next steps:"
    echo -e "    1. Flash to USB: sudo dd if=${ISO_NAME}.iso of=/dev/sdX bs=4M status=progress"
    echo -e "    2. Boot from USB"
    echo -e "    3. Open http://localhost:8080"
    echo ""
else
    echo -e "${RED}ISO build failed — check output above${NC}"
    exit 1
fi
