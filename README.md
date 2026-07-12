# KATHAL OS 🍈

**Portable, self-hosted OS with a web dashboard — like CasaOS, but simpler.**

Run it from a USB pendrive, a VM, or your server. One command to install,
one browser tab to manage everything.

## What is KATHAL?

KATHAL is a lightweight operating system dashboard that runs on Docker.
It gives you a beautiful web UI to manage containers, monitor system
resources, and deploy applications — all from your browser.

## Quick Start

```bash
# On any Ubuntu/Debian system:
sudo bash <(curl -fsSL https://raw.githubusercontent.com/bakeweb/kathal-os/main/scripts/install.sh)

# Or with Docker directly:
docker run -d \
  --name kathal \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/bakeweb/kathal-os:latest
```

Open http://localhost:8080 in your browser.

## Features

- **System Dashboard** — CPU, memory, disk, network metrics in real-time
- **Container Management** — Start, stop, restart, delete containers
- **Image Browser** — View all Docker images on your system
- **App Store** — One-click deploy for popular apps (Nginx, Postgres, Redis...)
- **Dark Mode** — Beautiful dark UI that's easy on the eyes
- **Lightweight** — Single Go binary, <10MB Docker image

## Architecture

```
USB Pendrive / VM / Server
  └── Ubuntu minimal
       └── Docker Engine
            └── kathal container
                 ├── Go backend (Docker API, system metrics, SQLite)
                 └── React dashboard (port 8080)
```

## Development

```bash
# Backend
go run ./cmd/kathal

# Frontend (dev mode with hot reload)
cd web && npm run dev
```

## Tech Stack

- **Backend:** Go 1.22, Docker Engine API, gopsutil, SQLite
- **Frontend:** React 18, Tailwind CSS, Vite, React Router
- **Infrastructure:** Docker, Docker Compose
- **Database:** SQLite (embedded, zero-config)

## License

MIT
