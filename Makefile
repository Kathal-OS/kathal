# KATHAL OS — Cross-platform release builder.
# Usage: make release          (build all platforms)
#        make release-linux     (Linux only)
#        make release-windows   (Windows only)
#        make release-mac       (macOS only)
#        make iso               (requires Linux + live-build)

VERSION  ?= 0.1.0
BIN_NAME  = kathal
BUILD_DIR = dist

# Go build flags — static binary, stripped debug info.
GOFLAGS   = -trimpath -ldflags="-s -w"

.PHONY: all clean release release-linux release-windows release-mac iso frontend

all: release

# ── Frontend ──────────────────────────────────────────────
frontend:
	cd web && npm ci && npm run build
	rm -rf cmd/kathal/web/dist
	mkdir -p cmd/kathal/web/dist/assets
	cp web/dist/index.html cmd/kathal/web/dist/
	cp web/dist/assets/* cmd/kathal/web/dist/assets/

# ── Cross-compile ─────────────────────────────────────────
release-linux: frontend
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 go build $(GOFLAGS) -o $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-linux-amd64 ./cmd/kathal
	@echo "  ✓ linux/amd64 → $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-linux-amd64"

release-windows: frontend
	@mkdir -p $(BUILD_DIR)
	GOOS=windows GOARCH=amd64 go build $(GOFLAGS) -o $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-windows-amd64.exe ./cmd/kathal
	@echo "  ✓ windows/amd64 → $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-windows-amd64.exe"

release-mac: frontend
	@mkdir -p $(BUILD_DIR)
	GOOS=darwin GOARCH=arm64 go build $(GOFLAGS) -o $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-darwin-arm64 ./cmd/kathal
	GOOS=darwin GOARCH=amd64 go build $(GOFLAGS) -o $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-darwin-amd64 ./cmd/kathal
	@echo "  ✓ darwin/arm64 → $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-darwin-arm64"
	@echo "  ✓ darwin/amd64 → $(BUILD_DIR)/$(BIN_NAME)-$(VERSION)-darwin-amd64"

release: release-linux release-windows release-mac
	@echo ""
	@echo "  ╔═══════════════════════════════════════╗"
	@echo "  ║  All builds complete!                 ║"
	@echo "  ╚═══════════════════════════════════════╝"
	@ls -lh $(BUILD_DIR)/

# ── ISO (Linux only, requires sudo + live-build) ─────────
iso: release-linux
	@echo "  Building ISO with embedded binary..."
	sudo bash iso/build-iso.sh

# ── Clean ─────────────────────────────────────────────────
clean:
	rm -rf $(BUILD_DIR)
	rm -rf iso/iso-work
	rm -rf cmd/kathal/web/dist
