'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Box,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Play,
  Stop,
  Restart,
  Trash2,
  Copy,
  Edit,
  Terminal,
  Logs,
  Settings,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  X,
  CheckCircle,
  Square,
  Circle,
  Pause,
} from 'lucide-react'
import Link from 'next/link'

const mockContainers = [
  { id: 'a1b2c3d4e5f6g7h8', name: 'nginx-proxy', image: 'nginx:alpine', status: 'running', cpu: '2.1%', mem: '45MB', ports: '80,443', created: '2 days ago', uptime: '2d 4h 12m', runtime: 'docker' },
  { id: 'e5f6g7h8i9j0k1l2', name: 'postgres-primary', image: 'postgres:15', status: 'running', cpu: '5.3%', mem: '1.2GB', ports: '5432', created: '5 days ago', uptime: '5d 12h 34m', runtime: 'docker' },
  { id: 'm3n4o5p6q7r8s9t0', name: 'redis-cache', image: 'redis:7-alpine', status: 'running', cpu: '0.8%', mem: '89MB', ports: '6379', created: '10 days ago', uptime: '10d 2h 15m', runtime: 'docker' },
  { id: 'u1v2w3x4y5z6a7b8', name: 'grafana', image: 'grafana/grafana:10.2', status: 'running', cpu: '1.2%', mem: '156MB', ports: '3000', created: '3 days ago', uptime: '3d 8h 45m', runtime: 'docker' },
  { id: 'c9d0e1f2g3h4i5j6', name: 'prometheus', image: 'prom/prometheus:v2.48', status: 'running', cpu: '3.4%', mem: '2.1GB', ports: '9090', created: '7 days ago', uptime: '7d 1h 22m', runtime: 'docker' },
  { id: 'k7l8m9n0o1p2q3r4', name: 'portainer', image: 'portainer/portainer-ce:2.21', status: 'stopped', cpu: '0%', mem: '0MB', ports: '9000', created: '1 day ago', uptime: '0s', runtime: 'docker' },
  { id: 's5t6u7v8w9x0y1z2', name: 'traefik', image: 'traefik:v2.10', status: 'running', cpu: '1.5%', mem: '32MB', ports: '80,443,8080', created: '4 days ago', uptime: '4d 6h 30m', runtime: 'docker' },
  { id: 'a3b4c5d6e7f8g9h0', name: 'loki', image: 'grafana/loki:2.9', status: 'running', cpu: '0.9%', mem: '124MB', ports: '3100', created: '6 days ago', uptime: '6d 14h 18m', runtime: 'docker' },
  { id: 'i1j2k3l4m5n6o7p8', name: 'promtail', image: 'grafana/promtail:2.9', status: 'running', cpu: '0.3%', mem: '18MB', ports: '', created: '6 days ago', uptime: '6d 14h 18m', runtime: 'docker' },
  { id: 'q9r0s1t2u3v4w5x6', name: 'cadvisor', image: 'gcr.io/cadvisor/cadvisor:v0.47', status: 'running', cpu: '0.7%', mem: '45MB', ports: '8080', created: '8 days ago', uptime: '8d 3h 55m', runtime: 'docker' },
  { id: 'z7x8c9v0b1n2m3q4', name: 'wasm-demo', image: 'wasm/example:v1.0', status: 'running', cpu: '0.5%', mem: '12MB', ports: '8080', created: '1 day ago', uptime: '1d 2h 10m', runtime: 'wasm' },
  { id: 'w5e6r7t8y9u0i1o2', name: 'containerd-app', image: 'myapp:v2.3', status: 'paused', cpu: '0%', mem: '0MB', ports: '', created: '3 days ago', uptime: '0s', runtime: 'containerd' },
]

export default function ContainersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped' | 'paused'>('all')
  const [runtimeFilter, setRuntimeFilter] = useState<'all' | 'docker' | 'containerd' | 'wasm'>('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created', direction: 'desc' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedContainers, setSelectedContainers] = useState<string[]>([])
  const [selectedContainer, setSelectedContainer] = useState<typeof mockContainers[0] | null>(null)

  const filteredContainers = mockContainers.filter((container) => {
    const matchesSearch = container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      container.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
      container.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || container.status === statusFilter
    const matchesRuntime = runtimeFilter === 'all' || container.runtime === runtimeFilter
    return matchesSearch && matchesStatus && matchesRuntime
  })

  const sortedContainers = [...filteredContainers].sort((a, b) => {
    const aVal = a[sortConfig.key as keyof typeof a]
    const bVal = b[sortConfig.key as keyof typeof b]
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const toggleSelectAll = () => {
    if (selectedContainers.length === filteredContainers.length) {
      setSelectedContainers([])
    } else {
      setSelectedContainers(filteredContainers.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedContainers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'start' | 'stop' | 'restart' | 'remove') => {
    const containersToAct = selectedContainers.length > 0
      ? mockContainers.filter(c => selectedContainers.includes(c.id))
      : filteredContainers

    containersToAct.forEach(container => {
      let newStatus = container.status
      if (action === 'start') newStatus = 'running'
      else if (action === 'stop') newStatus = 'stopped'
      else if (action === 'restart') newStatus = 'running'
      else if (action === 'remove') newStatus = 'removed'
    })
    setSelectedContainers([])
  }

  const statusColors = {
    running: 'bg-green-500',
    stopped: 'bg-amber-500',
    paused: 'bg-blue-500',
    restarting: 'bg-blue-500',
    dead: 'bg-red-500',
    exited: 'bg-amber-500',
    created: 'bg-gray-500',
  }

  const statusLabels = {
    running: 'Running',
    stopped: 'Stopped',
    paused: 'Paused',
    restarting: 'Restarting',
    dead: 'Dead',
    exited: 'Exited',
    created: 'Created',
  }

  const runtimeColors = {
    docker: 'bg-blue-500',
    containerd: 'bg-purple-500',
    wasm: 'bg-green-500',
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-content-primary">Containers</h1>
          <p className="text-body-md text-content-secondary mt-1">
            Manage your containers across all runtimes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Container
          </button>
          <button className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-medium text-body-sm hover:bg-surface-hover/80 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search containers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                aria-label="Search containers"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'running' | 'stopped' | 'paused')}
              className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="paused">Paused</option>
            </select>

            <select
              value={runtimeFilter}
              onChange={(e) => setRuntimeFilter(e.target.value as 'all' | 'docker' | 'containerd' | 'wasm')}
              className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Filter by runtime"
            >
              <option value="all">All Runtimes</option>
              <option value="docker">Docker</option>
              <option value="containerd">containerd</option>
              <option value="wasm">WASM</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Run Container
              </button>
              <button className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-medium text-body-sm hover:bg-surface-hover/80 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedContainers.length > 0 && (
        <div className="card p-3 mb-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-body-sm text-primary-700 dark:text-primary-300">
                {selectedContainers.length} container(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedContainers.length === filteredContainers.length ? 'Deselect all' : 'Select all visible'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('start')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg font-medium text-body-xs hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Start
              </button>
              <button
                onClick={() => handleBulkAction('stop')}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg font-medium text-body-xs hover:bg-amber-600 transition-colors flex items-center gap-1"
              >
                <Stop className="w-3 h-3" /> Stop
              </button>
              <button
                onClick={() => handleBulkAction('restart')}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-medium text-body-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Restart className="w-3 h-3" /> Restart
              </button>
              <button
                onClick={() => handleBulkAction('remove')}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium text-body-xs hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
              <button
                onClick={() => setSelectedContainers([])}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Containers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken/50">
                <th className="w-12 py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedContainers.length === filteredContainers.length && filteredContainers.length > 0}
                    indeterminate={selectedContainers.length > 0 && selectedContainers.length < filteredContainers.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    aria-label="Select all"
                  />
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Container
                    {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('image')}
                >
                  <div className="flex items-center gap-1">
                    Image
                    {sortConfig.key === 'image' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('runtime')}
                >
                  <div className="flex items-center gap-1">
                    Runtime
                    {sortConfig.key === 'runtime' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">
                  CPU
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">
                  Memory
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">
                  Ports
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">
                  Uptime
                </th>
                <th className="w-48 text-right py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedContainers.map((container) => (
                <tr
                  key={container.id}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => setSelectedContainer(container)}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedContainers.includes(container.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(container.id); }}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                      aria-label={`Select ${container.name}`}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                        container.runtime === 'docker' && 'bg-blue-100 dark:bg-blue-900/30',
                        container.runtime === 'containerd' && 'bg-purple-100 dark:bg-purple-900/30',
                        container.runtime === 'wasm' && 'bg-green-100 dark:bg-green-900/30'
                      )}>
                        {container.runtime === 'docker' && <Box className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {container.runtime === 'containerd' && <Square className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {container.runtime === 'wasm' && <Hexagon className="w-4 h-4 text-green-600 dark:text-green-400" />}
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
                      <span className="w-2 h-2 rounded-full bg-white/80" aria-hidden="true" />
                      <span className="capitalize">{statusLabels[container.status as keyof typeof statusLabels] || container.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary hidden lg:table-cell">
                    <span className={cn('w-2 h-2 rounded-full mr-2', runtimeColors[container.runtime])} aria-hidden="true" />
                    {container.runtime.charAt(0).toUpperCase() + container.runtime.slice(1)}
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{container.cpu}</td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{container.mem}</td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{container.ports || '—'}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary hidden md:table-cell">{container.created}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary hidden lg:table-cell">{container.uptime}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedContainer(container); }}
                        className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                        aria-label="View logs"
                      >
                        <Logs className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                        aria-label={container.status === 'running' ? 'Stop' : 'Start'}
                      >
                        {container.status === 'running' ? <Stop className="w-4 h-4 text-content-tertiary" /> : <Play className="w-4 h-4 text-content-tertiary" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                        aria-label="Restart"
                      >
                        <Restart className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-4 h-4 text-content-tertiary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedContainers.length === 0 && (
          <div className="p-12 text-center">
            <Box className="w-12 h-12 text-content-tertiary mx-auto mb-4" />
            <h3 className="text-heading-sm font-medium text-content-primary mb-2">No containers found</h3>
            <p className="text-body-md text-content-secondary mb-4">
              {searchQuery || statusFilter !== 'all' || runtimeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Run your first container to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Run Container
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-body-sm text-content-secondary">
          Showing {sortedContainers.length} of {mockContainers.length} containers
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-border rounded-lg text-body-sm hover:bg-surface-hover transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1.5 border border-border rounded-lg text-body-sm hover:bg-surface-hover transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>

      {/* Create Container Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-md font-semibold text-content-primary">Run New Container</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <h3 className="text-heading-sm font-semibold text-content-primary">Basic Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="container-name" className="label">Container Name</label>
                    <input
                      id="container-name"
                      type="text"
                      placeholder="my-container"
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="container-image" className="label">Image <span className="text-red-500">*</span></label>
                    <input
                      id="container-image"
                      type="text"
                      placeholder="nginx:alpine, postgres:15, redis:7-alpine..."
                      className="input"
                      autoFocus
                    />
                    <p className="text-body-xs text-content-tertiary mt-1">Enter image name with optional tag (e.g., nginx:alpine)</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="container-command" className="label">Command (optional)</label>
                  <input
                    id="container-command"
                    type="text"
                    placeholder="Override default command"
                    className="input"
                  />
                  <p className="text-body-xs text-content-tertiary mt-1">Leave empty to use image default</p>
                </div>
              </div>

              {/* Ports */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading-sm font-semibold text-content-primary">Ports</h3>
                  <button className="btn-secondary btn-sm">
                    <Plus className="w-3 h-3" />
                    Add Port
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <label className="label">Host Port</label>
                      <input type="number" placeholder="8080" className="input" min="1" max="65535" />
                    </div>
                    <div className="col-span-3">
                      <label className="label">Container Port</label>
                      <input type="number" placeholder="80" className="input" min="1" max="65535" />
                    </div>
                    <div className="col-span-3">
                      <label className="label">Protocol</label>
                      <select className="input">
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="label">Host IP</label>
                      <input type="text" placeholder="0.0.0.0" className="input" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading-sm font-semibold text-content-primary">Environment Variables</h3>
                  <button className="btn-secondary btn-sm">
                    <Plus className="w-3 h-3" />
                    Add Variable
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="label">Key</label>
                      <input type="text" placeholder="POSTGRES_PASSWORD" className="input" />
                    </div>
                    <div className="col-span-6">
                      <label className="label">Value</label>
                      <input type="text" placeholder="secret123" className="input" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-content-tertiary" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volumes */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading-sm font-semibold text-content-primary">Volumes</h3>
                  <button className="btn-secondary btn-sm">
                    <Plus className="w-3 h-3" />
                    Add Volume
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <label className="label">Type</label>
                      <select className="input">
                        <option value="bind">Bind Mount</option>
                        <option value="volume">Named Volume</option>
                        <option value="tmpfs">Tmpfs</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="label">Source</label>
                      <input type="text" placeholder="/host/path or volume-name" className="input" />
                    </div>
                    <div className="col-span-3">
                      <label className="label">Target</label>
                      <input type="text" placeholder="/container/path" className="input" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-content-tertiary" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4 border-t border-border pt-6">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-content-secondary hover:text-content-primary">
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    <span className="font-medium text-body-sm">Advanced Options</span>
                  </summary>
                  <div className="mt-4 space-y-4 pl-6 border-l-2 border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Restart Policy</label>
                        <select className="input">
                          <option value="no">No</option>
                          <option value="on-failure">On Failure</option>
                          <option value="always" selected>Always</option>
                          <option value="unless-stopped">Unless Stopped</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Max Retry Count</label>
                        <input type="number" value="3" className="input" min="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">CPU Limit (cores)</label>
                        <input type="number" step="0.1" placeholder="1.0" className="input" />
                      </div>
                      <div>
                        <label className="label">Memory Limit (MB)</label>
                        <input type="number" placeholder="512" className="input" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="privileged" className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" />
                      <label htmlFor="privileged" className="text-body-sm text-content-secondary">Privileged Mode</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="readonly" className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" />
                      <label htmlFor="readonly" className="text-body-sm text-content-secondary">Read-only Root Filesystem</label>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button className="btn-primary">
                <Play className="w-4 h-4" />
                Run Container
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container Detail Modal */}
      {selectedContainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in" onClick={() => setSelectedContainer(null)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Box className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-heading-md font-semibold text-content-primary">{selectedContainer.name}</h2>
                  <p className="text-body-sm text-content-tertiary font-mono">{selectedContainer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContainer(null)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Status</p>
                  <p className="text-heading-sm font-semibold text-content-primary capitalize">{selectedContainer.status}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Runtime</p>
                  <p className="text-heading-sm font-semibold text-content-primary capitalize">{selectedContainer.runtime}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Uptime</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedContainer.uptime}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Image</p>
                  <p className="text-body-sm font-mono text-content-primary">{selectedContainer.image}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Ports</p>
                  <p className="text-body-sm font-mono text-content-primary">{selectedContainer.ports || '—'}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">CPU</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedContainer.cpu}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Memory</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedContainer.mem}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="btn-secondary">
                  <Logs className="w-4 h-4" />
                  Logs
                </button>
                <button className="btn-secondary">
                  <Terminal className="w-4 h-4" />
                  Terminal
                </button>
                <button className={cn('btn-secondary', selectedContainer.status === 'running' ? '' : '')}>
                  {selectedContainer.status === 'running' ? <Stop className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {selectedContainer.status === 'running' ? 'Stop' : 'Start'}
                </button>
                <button className="btn-secondary">
                  <Restart className="w-4 h-4" />
                  Restart
                </button>
                <button className="btn-danger">
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}