'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Database,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Trash2,
  Copy,
  RefreshCw,
  X,
  ChevronDown,
  MoreVertical,
  HardDrive,
  Link as LinkIcon,
  Server,
  Network as NetworkIcon,
  Layers,
} from 'lucide-react'
import Link from 'next/link'

const mockVolumes = [
  { id: 'vol-nginx-logs', name: 'nginx-logs', driver: 'local', mountpoint: '/var/lib/docker/volumes/nginx-logs/_data', created: '2 days ago', size: '156MB', scope: 'local', containers: 2, runtime: 'docker' },
  { id: 'vol-postgres-data', name: 'postgres-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/postgres-data/_data', created: '5 days ago', size: '2.4GB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-redis-data', name: 'redis-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/redis-data/_data', created: '10 days ago', size: '89MB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-grafana-data', name: 'grafana-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/grafana-data/_data', created: '3 days ago', size: '234MB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-prometheus-data', name: 'prometheus-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/prometheus-data/_data', created: '7 days ago', size: '4.1GB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-portainer-data', name: 'portainer-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/portainer-data/_data', created: '1 day ago', size: '12MB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-traefik-certs', name: 'traefik-certs', driver: 'local', mountpoint: '/var/lib/docker/volumes/traefik-certs/_data', created: '4 days ago', size: '8.5MB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-loki-data', name: 'loki-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/loki-data/_data', created: '6 days ago', size: '1.2GB', scope: 'local', containers: 1, runtime: 'docker' },
  { id: 'vol-wasm-cache', name: 'wasm-cache', driver: 'local', mountpoint: '/var/lib/docker/volumes/wasm-cache/_data', created: '1 day ago', size: '45MB', scope: 'local', containers: 0, runtime: 'wasm' },
  { id: 'vol-containerd-apps', name: 'containerd-apps', driver: 'local', mountpoint: '/var/lib/containerd/io.containerd.content.v1.content', created: '3 days ago', size: '567MB', scope: 'local', containers: 3, runtime: 'containerd' },
]

export default function VolumesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [driverFilter, setDriverFilter] = useState<'all' | 'local' | 'nfs' | 'tmpfs'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [selectedVolume, setSelectedVolume] = useState<typeof mockVolumes[0] | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created', direction: 'desc' })

  const filteredVolumes = mockVolumes.filter((volume) => {
    const matchesSearch = volume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volume.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volume.mountpoint.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDriver = driverFilter === 'all' || volume.driver === driverFilter
    return matchesSearch && matchesDriver
  })

  const sortedVolumes = [...filteredVolumes].sort((a, b) => {
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
    if (selectedVolumes.length === filteredVolumes.length) {
      setSelectedVolumes([])
    } else {
      setSelectedVolumes(filteredVolumes.map(v => v.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedVolumes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'remove') => {
    if (action === 'remove') {
      setSelectedVolumes([])
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-content-primary">Volumes</h1>
          <p className="text-body-md text-content-secondary mt-1">
            Manage persistent storage for your containers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Volume
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
                placeholder="Search volumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                aria-label="Search volumes"
              />
            </div>

            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value as 'all' | 'local' | 'nfs' | 'tmpfs')}
              className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Filter by driver"
            >
              <option value="all">All Drivers</option>
              <option value="local">local</option>
              <option value="nfs">nfs</option>
              <option value="tmpfs">tmpfs</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Volume
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
      {selectedVolumes.length > 0 && (
        <div className="card p-3 mb-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-body-sm text-primary-700 dark:text-primary-300">
                {selectedVolumes.length} volume(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedVolumes.length === filteredVolumes.length ? 'Deselect all' : 'Select all visible'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('remove')}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium text-body-xs hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
              <button
                onClick={() => setSelectedVolumes([])}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volumes Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken/50">
                <th className="w-12 py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedVolumes.length === filteredVolumes.length && filteredVolumes.length > 0}
                    indeterminate={selectedVolumes.length > 0 && selectedVolumes.length < filteredVolumes.length}
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
                    Name
                    {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('driver')}
                >
                  <div className="flex items-center gap-1">
                    Driver
                    {sortConfig.key === 'driver' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('size')}
                >
                  Size
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('mountpoint')}
                >
                  Mountpoint
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('containers')}
                >
                  Containers
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('created')}
                >
                  Created
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('runtime')}
                >
                  Runtime
                </th>
                <th className="w-32 text-right py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVolumes.map((volume) => (
                <tr
                  key={volume.id}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => setSelectedVolume(volume)}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedVolumes.includes(volume.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(volume.id); }}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                      aria-label={`Select ${volume.name}`}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                        volume.runtime === 'docker' && 'bg-blue-100 dark:bg-blue-900/30',
                        volume.runtime === 'containerd' && 'bg-purple-100 dark:bg-purple-900/30',
                        volume.runtime === 'wasm' && 'bg-green-100 dark:bg-green-900/30'
                      )}>
                        {volume.runtime === 'docker' && <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {volume.runtime === 'containerd' && <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {volume.runtime === 'wasm' && <Server className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-body-sm text-content-primary">{volume.name}</p>
                        <p className="text-xs text-content-tertiary font-mono">{volume.id.slice(0, 12)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{volume.driver}</span>
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{volume.size}</td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell truncate max-w-[200px]">{volume.mountpoint}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary font-mono hidden lg:table-cell">{volume.containers}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary hidden lg:table-cell">{volume.created}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary hidden lg:table-cell capitalize">{volume.runtime}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedVolume(volume); }}
                        className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                        aria-label="View details"
                      >
                        <Eye className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                        aria-label="Inspect"
                      >
                        <LinkIcon className="w-4 h-4 text-content-tertiary" />
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

        {sortedVolumes.length === 0 && (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-content-tertiary mx-auto mb-4" />
            <h3 className="text-heading-sm font-medium text-content-primary mb-2">No volumes found</h3>
            <p className="text-body-md text-content-secondary mb-4">
              {searchQuery || driverFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first volume to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Volume
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-body-sm text-content-secondary">
          Showing {sortedVolumes.length} of {mockVolumes.length} volumes
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

      {/* Create Volume Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-md font-semibold text-content-primary">Create Volume</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="volume-name" className="label">Volume Name <span className="text-red-500">*</span></label>
                <input
                  id="volume-name"
                  type="text"
                  placeholder="my-volume"
                  className="input"
                  autoFocus
                />
                <p className="text-body-xs text-content-tertiary mt-1">Alphanumeric, hyphens, underscores only</p>
              </div>

              <div>
                <label htmlFor="volume-driver" className="label">Driver</label>
                <select id="volume-driver" className="input">
                  <option value="local">local</option>
                  <option value="nfs">nfs</option>
                  <option value="tmpfs">tmpfs</option>
                  <option value="aws-ebs">aws-ebs</option>
                  <option value="azure-file">azure-file</option>
                  <option value="gce-pd">gce-pd</option>
                </select>
              </div>

              <div>
                <label className="label">Driver Options</label>
                <div className="space-y-3" id="driver-options-container">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="label">Key</label>
                      <input type="text" placeholder="type" className="input" />
                    </div>
                    <div className="col-span-6">
                      <label className="label">Value</label>
                      <input type="text" placeholder="nfs" className="input" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-content-tertiary" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button className="btn-secondary btn-sm">
                  <Plus className="w-3 h-3" />
                  Add Option
                </button>
              </div>

              <div>
                <label className="label">Labels</label>
                <div className="space-y-3" id="labels-container">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="label">Key</label>
                      <input type="text" placeholder="com.example.description" className="input" />
                    </div>
                    <div className="col-span-6">
                      <label className="label">Value</label>
                      <input type="text" placeholder="Production database volume" className="input" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-content-tertiary" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button className="btn-secondary btn-sm">
                  <Plus className="w-3 h-3" />
                  Add Label
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Create Volume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volume Detail Modal */}
      {selectedVolume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in" onClick={() => setSelectedVolume(null)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                  selectedVolume.runtime === 'docker' && 'bg-blue-100 dark:bg-blue-900/30',
                  selectedVolume.runtime === 'containerd' && 'bg-purple-100 dark:bg-purple-900/30',
                  selectedVolume.runtime === 'wasm' && 'bg-green-100 dark:bg-green-900/30'
                )}>
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-heading-md font-semibold text-content-primary">{selectedVolume.name}</h2>
                  <p className="text-body-sm text-content-tertiary font-mono">{selectedVolume.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolume(null)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Driver</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedVolume.driver}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Size</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedVolume.size}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Containers</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedVolume.containers}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Mountpoint</p>
                  <p className="text-body-sm font-mono text-content-primary truncate">{selectedVolume.mountpoint}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Created</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedVolume.created}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Runtime</p>
                  <p className="text-heading-sm font-semibold text-content-primary capitalize">{selectedVolume.runtime}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Scope</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedVolume.scope}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="btn-secondary">
                  <LinkIcon className="w-4 h-4" />
                  Inspect
                </button>
                <button className="btn-secondary">
                  <HardDrive className="w-4 h-4" />
                  Backup
                </button>
                <button className="btn-secondary">
                  <Server className="w-4 h-4" />
                  Prune Unused
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