'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Box,
  Image,
  Layers,
  Database,
  Server,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Bell,
  User,
  RefreshCw,
  Search,
  Plus,
  Play,
  Stop,
  Restart,
  Trash2,
  Download,
  Eye,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Activity,
  Square,
  CheckCircle,
  XCircle,
  ExternalLink,
  Hexagon,
  Zap,
  Filter,
  MoreVertical,
} from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/containers', label: 'Containers', icon: Box },
  { href: '/images', label: 'Images', icon: Image },
  { href: '/compose', label: 'Compose', icon: Layers },
  { href: '/volumes', label: 'Volumes', icon: Database },
  { href: '/networks', label: 'Networks', icon: Server },
  { href: '/terminal', label: 'Terminal', icon: Terminal },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const runtimeItems = [
  { id: 'docker', name: 'Docker', version: '24.0.7', status: 'running', icon: Box },
  { id: 'containerd', name: 'containerd', version: '1.7.2', status: 'running', icon: Box },
  { id: 'wasm', name: 'WASM (wasmtime)', version: '18.0.0', status: 'available', icon: Hexagon },
  { id: 'podman', name: 'Podman', version: '4.9.0', status: 'stopped', icon: Box },
]

export default function DashboardPage() {
  const pathname = '/'
  const {
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    containers,
    images,
    systemInfo,
    stats,
    loading,
    setLoading,
    selectedContainer,
    setSelectedContainer,
    selectedImage,
    setSelectedImage,
  } = useAppStore()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setLocalTheme(theme)
  }, [theme])

  const statusColors = {
    running: 'bg-green-500',
    stopped: 'bg-amber-500',
    paused: 'bg-blue-500',
    restarting: 'bg-blue-500',
    dead: 'bg-red-500',
    exited: 'bg-amber-500',
    created: 'bg-gray-500',
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'stopped':
        return <Square className="w-4 h-4 text-amber-500" />
      case 'paused':
        return <Circle className="w-4 h-4 text-blue-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  // Mock data
  const mockSystemInfo = {
    hostname: 'kathal-server-01',
    os: 'Ubuntu 22.04.3 LTS',
    kernel: '6.5.0-15-generic',
    uptime: '14 days, 6 hours',
    cpus: 16,
    memory: { total: 64, used: 28, unit: 'GB' },
    disk: { total: 2000, used: 847, unit: 'GB' },
    runtime: 'Docker 24.0.7',
    containerd: '1.7.2',
    kubernetes: 'v1.28.4',
  }

  const mockContainers = [
    { id: 'a1b2c3d4e5f6', name: 'nginx-proxy', image: 'nginx:alpine', status: 'running', cpu: '2.1%', mem: '45MB', ports: '80,443', created: '2 days ago' },
    { id: 'e5f6g7h8i9j0', name: 'postgres-primary', image: 'postgres:15', status: 'running', cpu: '5.3%', mem: '1.2GB', ports: '5432', created: '5 days ago' },
    { id: 'k1l2m3n4o5p6', name: 'redis-cache', image: 'redis:7-alpine', status: 'running', cpu: '0.8%', mem: '89MB', ports: '6379', created: '10 days ago' },
    { id: 'q7r8s9t0u1v2', name: 'grafana', image: 'grafana/grafana:10.2', status: 'running', cpu: '1.2%', mem: '156MB', ports: '3000', created: '3 days ago' },
    { id: 'w3x4y5z6a7b8', name: 'prometheus', image: 'prom/prometheus:v2.48', status: 'running', cpu: '3.4%', mem: '2.1GB', ports: '9090', created: '7 days ago' },
    { id: 'c9d0e1f2g3h4', name: 'portainer', image: 'portainer/portainer-ce:2.21', status: 'stopped', cpu: '0%', mem: '0MB', ports: '9000', created: '1 day ago' },
  ]

  const mockImages = [
    { id: 'sha256:abc123def456', repo: 'nginx', tag: 'alpine', size: '42MB', created: '2 days ago' },
    { id: 'sha256:def456ghi789', repo: 'postgres', tag: '15', size: '412MB', created: '1 week ago' },
    { id: 'sha256:ghi789jkl012', repo: 'redis', tag: '7-alpine', size: '33MB', created: '2 weeks ago' },
    { id: 'sha256:jkl012mno345', repo: 'grafana/grafana', tag: '10.2', size: '287MB', created: '3 days ago' },
    { id: 'sha256:mno345pqr678', repo: 'prom/prometheus', tag: 'v2.48', size: '189MB', created: '1 week ago' },
    { id: 'sha256:pqr678stu901', repo: 'portainer/portainer-ce', tag: '2.21', size: '215MB', created: '5 days ago' },
  ]

  const mockStats = {
    containers: { total: 24, running: 18, stopped: 6, paused: 0 },
    images: { total: 47, size: '12.4GB' },
    volumes: { total: 32, size: '4.2GB' },
    networks: { total: 12 },
    cpus: { usage: 23.4 },
    memory: { usage: 43.8 },
    disk: { usage: 42.3 },
    network: { rx: '2.4GB', tx: '1.8GB' },
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static z-50 h-full bg-surface border-r border-border transition-all duration-300 ease-out flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-border', !sidebarOpen && 'justify-center')}>
          <Link href="/" className="flex items-center gap-3" aria-label="Kathal OS Home">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-heading-md font-semibold text-content-primary">Kathal OS</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      'group relative overflow-hidden',
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary',
                      !sidebarOpen && 'justify-center'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    title={sidebarOpen ? undefined : item.label}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {sidebarOpen && <span className="font-medium text-body-sm">{item.label}</span>}
                    {isActive && sidebarOpen && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Runtime Status Section */}
          {sidebarOpen && (
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="px-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">
                Runtimes
              </h3>
              <ul className="space-y-2" role="list">
                {runtimeItems.map((runtime) => (
                  <li key={runtime.id}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors">
                      <runtime.icon className="w-5 h-5 text-content-tertiary" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-body-sm text-content-primary">{runtime.name}</span>
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            runtime.status === 'running' ? 'bg-green-500' :
                            runtime.status === 'available' ? 'bg-blue-500' :
                            'bg-gray-500'
                          )} aria-hidden="true" />
                        </div>
                        <span className="text-xs text-content-tertiary">v{runtime.version}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className={cn('w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0', !sidebarOpen && 'mx-auto')}>
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-body-sm text-content-primary truncate">Admin User</p>
                <p className="text-xs text-content-tertiary">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 flex flex-col min-w-0', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-surface-hover transition-colors"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block flex-1" />
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search containers, images, volumes..."
                className="w-64 pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                aria-label="Search"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setLocalTheme(localTheme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
              aria-label={localTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {localTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
            </button>

            {/* Refresh */}
            <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors" aria-label="Refresh data">
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-hover transition-colors" aria-label="User menu">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="hidden md:block font-medium text-body-sm text-content-primary">Admin</span>
                <ChevronLeft className="w-4 h-4 text-content-tertiary" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-heading-lg font-semibold text-content-primary">Dashboard</h1>
              <p className="text-body-md text-content-secondary mt-1">Overview of your infrastructure</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Container
              </button>
              <button className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-medium text-body-sm hover:bg-surface-hover/80 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Containers"
              value={`${mockStats.containers.running} / ${mockStats.containers.total}`}
              subtitle={`${mockStats.containers.running} running, ${mockStats.containers.stopped} stopped`}
              icon={Box}
              iconColor="primary"
              trend="+2"
              trendLabel="this week"
            />
            <StatCard
              title="Images"
              value={`${mockStats.images.total}`}
              subtitle={`${mockStats.images.size} total size`}
              icon={Image}
              iconColor="success"
              trend="+5"
              trendLabel="this month"
            />
            <StatCard
              title="CPU Usage"
              value={`${mockStats.cpus.usage}%`}
              subtitle={`${100 - mockStats.cpus.usage}% available`}
              icon={Cpu}
              iconColor="warning"
              trend="-1.2%"
              trendLabel="vs yesterday"
            />
            <StatCard
              title="Memory Usage"
              value={`${mockStats.memory.usage}%`}
              subtitle={`${mockSystemInfo.memory.used}GB / ${mockSystemInfo.memory.total}GB`}
              icon={MemoryStick}
              iconColor="info"
              trend="+0.5%"
              trendLabel="vs yesterday"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* System Info + Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* System Info */}
              <Card title="System Information" icon={Server} action={<RefreshCw className="w-4 h-4" />}>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-body-sm text-content-secondary">Hostname</dt>
                    <dd className="text-body-sm font-mono text-content-primary">{mockSystemInfo.hostname}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-body-sm text-content-secondary">OS</dt>
                    <dd className="text-body-sm text-content-primary">{mockSystemInfo.os}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-body-sm text-content-secondary">Kernel</dt>
                    <dd className="text-body-sm font-mono text-content-primary">{mockSystemInfo.kernel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-body-sm text-content-secondary">Uptime</dt>
                    <dd className="text-body-sm text-content-primary">{mockSystemInfo.uptime}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-body-sm text-content-secondary">CPUs</dt>
                    <dd className="text-body-sm text-content-primary">{mockSystemInfo.cpus} cores</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-body-sm text-content-secondary">Runtime</dt>
                    <dd className="text-body-sm text-content-primary">{mockSystemInfo.runtime}</dd>
                  </div>
                </dl>
              </Card>

              {/* Quick Actions */}
              <Card title="Quick Actions" icon={Zap} action={<ExternalLink className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-3">
                  <QuickActionButton icon={Play} label="Run Container" href="/containers/new" />
                  <QuickActionButton icon={Layers} label="Deploy Stack" href="/compose/new" />
                  <QuickActionButton icon={Download} label="Pull Image" href="/images/pull" />
                  <QuickActionButton icon={Database} label="Create Volume" href="/volumes/new" />
                  <QuickActionButton icon={Server} label="Create Network" href="/networks/new" />
                  <QuickActionButton icon={Terminal} label="Open Terminal" href="/terminal" />
                </div>
              </Card>
            </div>

            {/* Resource Usage + Recent Containers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resource Usage */}
              <Card title="Resource Usage" icon={Activity} action={<RefreshCw className="w-4 h-4" />}>
                <div className="space-y-6">
                  <ResourceBar
                    label="CPU"
                    value={mockStats.cpus.usage}
                    max={100}
                    unit="%"
                    color="primary"
                    showMax
                  />
                  <ResourceBar
                    label="Memory"
                    value={mockStats.memory.usage}
                    max={100}
                    unit="%"
                    color="success"
                    showMax
                  />
                  <ResourceBar
                    label="Disk"
                    value={mockStats.disk.usage}
                    max={100}
                    unit="%"
                    color="warning"
                    showMax
                  />
                  <ResourceBar
                    label="Network RX"
                    value={2.4}
                    max={10}
                    unit="GB"
                    color="info"
                  />
                  <ResourceBar
                    label="Network TX"
                    value={1.8}
                    max={10}
                    unit="GB"
                    color="purple"
                  />
                </div>
              </Card>

              {/* Recent Containers */}
              <Card title="Recent Containers" icon={Box} action={
                <Link href="/containers" className="text-body-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                  View all
                  <ChevronRight className="w-3 h-3" />
                </Link>
              }>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Container</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden md:table-cell">Image</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">CPU</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">Memory</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">Ports</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockContainers.slice(0, 5).map((container) => (
                        <tr key={container.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                          onClick={() => setSelectedContainer(container)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <Box className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <p className="font-medium text-body-sm text-content-primary">{container.name}</p>
                                <p className="text-xs text-content-tertiary font-mono">{container.id.slice(0, 12)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-body-sm text-content-secondary hidden md:table-cell">{container.image}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              statusColors[container.status as keyof typeof statusColors]
                            )}>
                              {getStatusIcon(container.status)}
                              <span className="capitalize">{container.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{container.cpu}</td>
                          <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{container.mem}</td>
                          <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{container.ports}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="View logs">
                                <Eye className="w-4 h-4 text-content-tertiary" />
                              </button>
                              <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label={container.status === 'running' ? 'Stop' : 'Start'}>
                                {container.status === 'running' ? <Stop className="w-4 h-4 text-content-tertiary" /> : <Play className="w-4 h-4 text-content-tertiary" />}
                              </button>
                              <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Restart">
                                <Restart className="w-4 h-4 text-content-tertiary" />
                              </button>
                              <button className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Delete">
                                <Trash2 className="w-4 h-4 text-content-tertiary" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Grid - Images + System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Images */}
            <Card title="Recent Images" icon={Image} action={
              <Link href="/images" className="text-body-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                View all
                <ChevronRight className="w-3 h-3" />
              </Link>
            }>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Repository</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Tag</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Image ID</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Size</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Created</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockImages.slice(0, 5).map((image) => (
                      <tr key={image.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                        <td className="py-3 px-4 font-medium text-body-sm text-content-primary">{image.repo}</td>
                        <td className="py-3 px-4 text-body-sm text-content-secondary">{image.tag}</td>
                        <td className="py-3 px-4 text-body-sm text-content-tertiary font-mono">{image.id.slice(0, 12)}</td>
                        <td className="py-3 px-4 text-body-sm text-content-secondary">{image.size}</td>
                        <td className="py-3 px-4 text-body-sm text-content-tertiary">{image.created}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Pull">
                              <Download className="w-4 h-4 text-content-tertiary" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Inspect">
                              <Eye className="w-4 h-4 text-content-tertiary" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Delete">
                              <Trash2 className="w-4 h-4 text-content-tertiary" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* System Health */}
            <Card title="System Health" icon={Activity} action={<RefreshCw className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <HealthMetric label="Containers" value={`${mockStats.containers.running}/${mockStats.containers.total}`} status="healthy" />
                <HealthMetric label="Images" value={`${mockStats.images.total}`} status="healthy" />
                <HealthMetric label="Volumes" value={`${mockStats.volumes.total}`} status="healthy" />
                <HealthMetric label="Networks" value={`${mockStats.networks.total}`} status="healthy" />
                <HealthMetric label="CPU" value={`${mockStats.cpus.usage}%`} status={mockStats.cpus.usage > 80 ? 'warning' : 'healthy'} />
                <HealthMetric label="Memory" value={`${mockStats.memory.usage}%`} status={mockStats.memory.usage > 85 ? 'warning' : 'healthy'} />
                <HealthMetric label="Disk" value={`${mockStats.disk.usage}%`} status={mockStats.disk.usage > 90 ? 'error' : 'healthy'} />
                <HealthMetric label="Runtime" value="Docker" status="healthy" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Components

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
  trendLabel,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: 'primary' | 'success' | 'warning' | 'info' | 'purple'
  trend?: string
  trendLabel?: string
}) {
  const iconColors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <div className="card p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconColors[iconColor])}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
            {trend} {trendLabel && <span className="text-content-tertiary ml-1">{trendLabel}</span>}
          </span>
        )}
      </div>
      <div>
        <p className="text-heading-md font-semibold text-content-primary">{value}</p>
        <p className="text-body-sm text-content-secondary mt-1">{subtitle}</p>
        <p className="text-body-xs text-content-tertiary mt-2">{title}</p>
      </div>
    </div>
  )
}

function Card({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="card p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <h3 className="text-heading-sm font-semibold text-content-primary">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

function QuickActionButton({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>, label: string, href: string }) {
  return (
    <Link href={href} className="card-interactive p-4 flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      </div>
      <span className="text-body-sm font-medium text-content-primary">{label}</span>
    </Link>
  )
}

function ResourceBar({
  label,
  value,
  max,
  unit,
  color,
  showMax,
}: {
  label: string
  value: number
  max: number
  unit: string
  color: 'primary' | 'success' | 'warning' | 'info' | 'purple'
  showMax?: boolean
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
  }
  const bgClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-medium text-content-primary">{label}</span>
        <span className="text-body-sm font-mono text-content-secondary">
          {value.toFixed(1)}{unit} {showMax && <span className="text-content-tertiary">/ {max}{unit}</span>}
        </span>
      </div>
      <div className="h-2 bg-surface-sunken rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function HealthMetric({ label, value, status }: { label: string; value: string; status: 'healthy' | 'warning' | 'error' }) {
  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  }
  const statusBg = {
    healthy: 'bg-green-50 dark:bg-green-900/30',
    warning: 'bg-amber-50 dark:bg-amber-900/30',
    error: 'bg-red-50 dark:bg-red-900/30',
  }

  return (
    <div className="card-interactive p-4 flex flex-col items-center text-center">
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-3', statusBg[status])}>
        <div className={cn('w-3 h-3 rounded-full', statusColors[status])} aria-hidden="true" />
      </div>
      <p className="text-heading-sm font-semibold text-content-primary">{value}</p>
      <p className="text-body-sm text-content-secondary">{label}</p>
    </div>
  )
}