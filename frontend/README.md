# Kathal OS Frontend

A modern, responsive web dashboard for Kathal OS - the Infrastructure Operating System. Built with Next.js 14, TypeScript, Tailwind CSS, and Phase 7 design tokens.

## Features

- **Dashboard** - System overview with resource usage, container stats, and quick actions
- **Containers** - Full container lifecycle management (start, stop, restart, logs, terminal)
- **Images** - Image management (pull, inspect, tag, remove, bulk operations)
- **Compose Stacks** - Deploy and manage multi-container applications
- **Volumes** - Persistent storage management
- **Networks** - Network configuration and inspection
- **Terminal** - Built-in web terminal with command history and autocomplete
- **Settings** - Comprehensive configuration (8 categories, 50+ settings)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Phase 7 design tokens
- **State Management**: Zustand
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io client (ready for WebSocket integration)

## Phase 7 Design Tokens

The design system implements Phase 7 tokens:

- **Colors**: Semantic color system (surface, content, status, border)
- **Typography**: Inter + JetBrains Mono with 14 size scales
- **Spacing**: 8-step spacing system
- **Border Radius**: 7 levels from none to full
- **Shadows**: 6 elevation levels
- **Animations**: Fade, slide, scale, pulse with reduced motion support

## Getting Started

```bash
# Navigate to frontend directory
cd /c/Users/shruh/OneDrive/Desktop/kathal-os/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── containers/        # Container management
│   │   ├── images/            # Image management
│   │   ├── compose/           # Compose stacks
│   │   ├── volumes/           # Volume management
│   │   ├── networks/          # Network management
│   │   ├── terminal/          # Web terminal
│   │   ├── settings/          # Settings (8 tabs)
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles + Phase 7 tokens
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       └── Card.tsx       # Card, StatCard, ResourceBar, etc.
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── store/
│   │   └── appStore.ts        # Zustand state management
│   └── types/                 # TypeScript types (to be added)
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── .gitignore
```

## Pages Overview

### Dashboard (`/`)
- Resource usage cards (containers, images, CPU, memory)
- System information panel
- Quick action buttons
- Resource usage bars (CPU, memory, disk, network)
- Recent containers table
- Recent images table
- System health checks

### Containers (`/containers`)
- Searchable, filterable, sortable table
- Multi-runtime support (Docker, containerd, WASM)
- Bulk operations (start, stop, restart, remove)
- Container detail modal with actions
- Create container wizard (ports, env, volumes, advanced)

### Images (`/images`)
- Image listing with search and runtime filter
- Pull image modal with platform selection
- Bulk operations (pull, tag, remove)
- Sortable columns

### Compose (`/compose`)
- Stack cards with status and service count
- Deploy from Git, upload, or template
- Bulk operations
- Stack detail modal

### Volumes (`/volumes`)
- Volume listing with driver, size, mountpoint
- Create volume modal (driver options, labels)
- Bulk remove

### Networks (`/networks`)
- Network listing with subnet, gateway, driver
- Create network modal (IPAM, options, labels)
- Runtime-aware (Docker, containerd, WASM)

### Terminal (`/terminal`)
- Full web terminal with command history
- Tab completion for known commands
- Arrow key history navigation
- Built-in commands: help, sysinfo, containers, images, volumes, networks, stats, version, clear, history
- Search output, copy, download, clear

### Settings (`/settings`)
8 categories:
1. **General** - Auto-refresh, confirmations, tooltips, localization
2. **Appearance** - Theme (light/dark), compact mode, animations, layout
3. **Runtime** - Default runtime, auto-start, log limits, health checks, self-healing
4. **Network** - Default driver, DNS, proxy
5. **Storage** - Volume driver, backup retention, auto-prune
6. **Security** - TLS, API tokens, RBAC, audit logging
7. **Notifications** - Email, webhooks, alert rules
8. **Advanced** - Debug mode, telemetry, experimental features, maintenance

## State Management

Uses Zustand for global state:
- UI state (sidebar, theme)
- Data (containers, images, system info, stats)
- Loading/error states
- Selected items
- Filters

## API Integration Ready

The frontend is structured to connect to the Kathal OS backend:
- REST API endpoints in `next.config.js` rewrites
- WebSocket support via Socket.io client
- Auth token handling ready
- Error boundaries and loading states

## Customization

### Adding New Pages
1. Create `src/app/<page>/page.tsx`
2. Add navigation item in Dashboard sidebar
3. Follow existing patterns for consistency

### Extending Design Tokens
Edit `tailwind.config.ts` to add:
- New colors in `theme.extend.colors`
- New spacing in `theme.extend.spacing`
- New animations in `theme.extend.keyframes`

### Adding Backend Endpoints
Update `next.config.js` rewrites to proxy to your API server.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Server-side rendering for initial load
- Code splitting per page
- Optimized Lucide React imports
- Memoized components where appropriate
- Reduced motion support

## Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus visible outlines
- Color contrast compliance
- Reduced motion support

## Development

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Format
npx prettier --write .
```

## Production Deployment

```bash
npm run build
npm start
```

The build outputs to `.next/` and can be deployed to Vercel, Netlify, or any Node.js hosting.

## Integration with Kathal OS Backend

The frontend expects a backend API at `http://localhost:8080` (configurable in `next.config.js`):

```
/api/runtime/*      - Runtime management
/api/health/*       - Health checks
/api/containers/*   - Container operations
/api/images/*       - Image operations
/api/volumes/*      - Volume operations
/api/networks/*     - Network operations
/api/compose/*      - Compose stack operations
/api/system/*       - System info
/api/ws             - WebSocket for real-time updates
```

## License

Part of Kathal OS - Infrastructure Operating System