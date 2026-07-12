#!/bin/bash
# KATHAL OS Installer
# Installs KATHAL dashboard on an Ubuntu system (pendrive, VM, or server).
# Run as root: sudo bash install.sh
#
# This script:
# 1. Installs Docker Engine
# 2. Pulls and runs the KATHAL dashboard container
# 3. Sets up auto-start on boot
# 4. Configures the firewall
#
# After installation, access the dashboard at: http://<your-ip>:8080

set -euo pipefail

KATHAL_VERSION="${KATHAL_VERSION:-latest}"
KATHAL_PORT="${KATHAL_PORT:-8080}"
KATHAL_DATA="${KATHAL_DATA:-/opt/kathal/data}"
KATHAL_CONTAINER="kathal-dashboard"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[kathal]${NC} $1"; }
warn() { echo -e "${YELLOW}[kathal]${NC} $1"; }
error() { echo -e "${RED}[kathal]${NC} $1"; exit 1; }

# Check root.
if [ "$EUID" -ne 0 ]; then
    error "Please run as root: sudo bash install.sh"
fi

echo -e "${BLUE}"
echo "  ╦ ╦╔═╗╔═╗╔╦╗╦╔═╗╔═╗╔═╗"
echo "  ╠═╣║╣ ╚═╗ ║ ║╠═╣║  ╚═╗"
echo "  ╩ ╩╚═╝╚═╝ ╩ ╩╩ ╩╚═╝╚═╝"
echo "  Portable OS Dashboard"
echo -e "${NC}"

# Step 1: Install Docker.
log "Step 1/5: Checking Docker..."
if ! command -v docker &> /dev/null; then
    log "Installing Docker Engine..."
    apt-get update -qq
    apt-get install -y -qq ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    log "Docker installed!"
else
    log "Docker already installed: $(docker --version)"
fi

# Step 2: Create data directory.
log "Step 2/5: Setting up data directory..."
mkdir -p "$KATHAL_DATA"

# Step 3: Pull and run KATHAL.
log "Step 3/5: Pulling KATHAL dashboard..."
if docker ps -a --format '{{.Names}}' | grep -q "^${KATHAL_CONTAINER}$"; then
    log "Stopping existing container..."
    docker stop "$KATHAL_CONTAINER" 2>/dev/null || true
    docker rm "$KATHAL_CONTAINER" 2>/dev/null || true
fi

docker run -d \
    --name "$KATHAL_CONTAINER" \
    --restart unless-stopped \
    -p "$KATHAL_PORT:8080" \
    -v "$KATHAL_DATA:/data" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e KATHAL_JWT_SECRET="$(openssl rand -hex 32)" \
    ghcr.io/bakeweb/kathal-os:"$KATHAL_VERSION"

log "KATHAL dashboard started!"

# Step 4: Configure firewall.
log "Step 4/5: Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow "$KATHAL_PORT/tcp" comment "KATHAL Dashboard" 2>/dev/null || true
    log "Firewall rule added for port $KATHAL_PORT"
else
    warn "UFW not found, skipping firewall configuration"
fi

# Step 5: Get IP address.
log "Step 5/5: Getting IP address..."
IP_ADDR=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         KATHAL OS Installed!             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Dashboard: ${BLUE}http://${IP_ADDR}:${KATHAL_PORT}${NC}"
echo ""
echo -e "  Container: ${KATHAL_CONTAINER}"
echo -e "  Data:      ${KATHAL_DATA}"
echo -e "  Docker:    $(docker --version 2>/dev/null | cut -d' ' -f3 | tr -d ',')"
echo ""
echo -e "  Commands:"
echo -e "    Stop:    ${YELLOW}docker stop ${KATHAL_CONTAINER}${NC}"
echo -e "    Start:   ${YELLOW}docker start ${KATHAL_CONTAINER}${NC}"
echo -e "    Logs:    ${YELLOW}docker logs -f ${KATHAL_CONTAINER}${NC}"
echo -e "    Remove:  ${YELLOW}docker rm -f ${KATHAL_CONTAINER}${NC}"
echo ""
