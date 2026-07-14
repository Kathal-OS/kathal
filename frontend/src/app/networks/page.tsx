'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Server,
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
  Globe,
  Link as LinkIcon,
  Layers,
  Wifi,
  Shield,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

const mockNetworks = [
  { id: 'net-bridge', name: 'bridge', driver: 'bridge', scope: 'local', subnet: '172.17.0.0/16', gateway: '172.17.0.1', created: '14 days ago', containers: 8, runtime: 'docker' },
  { id: 'net-host', name: 'host', driver: 'host', scope: 'local', subnet: 'N/A', gateway: 'N/A', created: '14 days ago', containers: 2, runtime: 'docker' },
  { id: 'net-none', name: 'none', driver: 'null', scope: 'local', subnet: 'N/A', gateway: 'N/A', created: '14 days ago', containers: 1, runtime: 'docker' },
  { id: 'net-web', name: 'web-network', driver: 'bridge', scope: 'local', subnet: '172.20.0.0/16', gateway: '172.20.0.1', created: '2 days ago', containers: 4, runtime: 'docker' },
  { id: 'net-db', name: 'database-network', driver: 'bridge', scope: 'local', subnet: '172.25.0.0/16', gateway: '172.25.0.1', created: '5 days ago', containers: 3, runtime: 'docker' },
  { id: 'net-monitoring', name: 'monitoring-network', driver: 'bridge', scope: 'local', subnet: '172.30.0.0/16', gateway: '172.30.0.1', created: '5 days ago', containers: 5, runtime: 'docker' },
  { id: 'net-cicd', name: 'cicd-network', driver: 'bridge', scope: 'local', subnet: '172.35.0.0/16', gateway: '172.35.0.1', created: '10 days ago', containers: 6, runtime: 'docker' },
  { id: 'net-wasm', name: 'wasm-network', driver: 'bridge', scope: 'local', subnet: '172.40.0.0/16', gateway: '172.40.0.1', created: '1 day ago', containers: 1, runtime: 'wasm' },
  { id: 'net-containerd', name: 'containerd-network', driver: 'bridge', scope: 'local', subnet: '172.45.0.0/16', gateway: '172.45.0.1', created: '3 days ago', containers: 3, runtime: 'containerd' },
]

export default function NetworksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [driverFilter, setDriverFilter] = useState<'all' | 'bridge' | 'host' | 'overlay' | 'macvlan'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<typeof mockNetworks[0] | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created', direction: 'desc' })

  const filteredNetworks = mockNetworks.filter((network) => {
    const matchesSearch = network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      network.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      network.subnet.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDriver = driverFilter === 'all' || network.driver === driverFilter
    return matchesSearch && matchesDriver
  })

  const sortedNetworks = [...filteredNetworks].sort((a, b) => {
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
    if (selectedNetworks.length === filteredNetworks.length) {
      setSelectedNetworks([])
    } else {
      setSelectedNetworks(filteredNetworks.map(n => n.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'remove') => {
    if (action === 'remove') {
      setSelectedNetworks([])
    }
  }

  const runtimeColors = {
    docker: 'bg-blue-500',
    containerd: 'bg-purple-500',
    wasm: 'bg-green-500',
  }

  const driverColors = {
    bridge: 'bg-blue-500',
    host: 'bg-purple-500',
    overlay: 'bg-green-500',
    macvlan: 'bg-amber-500',
    null: 'bg-gray-500',
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-content-primary">Networks</h1>
          <p className="text-body-md text-content-secondary mt-1">
            Manage container networks across all runtimes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Network
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
                placeholder="Search networks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                aria-label="Search networks"
              />
            </div>

            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value as 'all' | 'bridge' | 'host' | 'overlay' | 'macvlan')}
              className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Filter by driver"
            >
              <option value="all">All Drivers</option>
              <option value="bridge">bridge</option>
              <option value="host">host</option>
              <option value="overlay">overlay</option>
              <option value="macvlan">macvlan</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Network
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
      {selectedNetworks.length > 0 && (
        <div className="card p-3 mb-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-body-sm text-primary-700 dark:text-primary-300">
                {selectedNetworks.length} network(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedNetworks.length === filteredNetworks.length ? 'Deselect all' : 'Select all visible'}
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
                onClick={() => setSelectedNetworks([])}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Networks Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken/50">
                <th className="w-12 py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedNetworks.length === filteredNetworks.length && filteredNetworks.length > 0}
                    indeterminate={selectedNetworks.length > 0 && selectedNetworks.length < filteredNetworks.length}
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
                  onClick={() => handleSort('subnet')}
                >
                  Subnet
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('gateway')}
                >
                  Gateway
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
              {sortedNetworks.map((network) => (
                <tr
                  key={network.id}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => setSelectedNetwork(network)}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedNetworks.includes(network.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(network.id); }}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                      aria-label={`Select ${network.name}`}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                        network.runtime === 'docker' && 'bg-blue-100 dark:bg-blue-900/30',
                        network.runtime === 'containerd' && 'bg-purple-100 dark:bg-purple-900/30',
                        network.runtime === 'wasm' && 'bg-green-100 dark:bg-green-900/30'
                      )}>
                        {network.runtime === 'docker' && <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {network.runtime === 'containerd' && <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {network.runtime === 'wasm' && <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-body-sm text-content-primary">{network.name}</p>
                        <p className="text-xs text-content-tertiary font-mono">{network.id.slice(0, 12)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary hidden md:table-cell">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
                      driverColors[network.driver as keyof typeof driverColors]
                    )}>{network.driver}</span>
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{network.subnet}</td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono hidden lg:table-cell">{network.gateway}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary font-mono hidden lg:table-cell">{network.containers}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary hidden lg:table-cell">{network.created}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary hidden lg:table-cell capitalize">{network.runtime}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedNetwork(network); }}
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

        {sortedNetworks.length === 0 && (
          <div className="p-12 text-center">
            <Server className="w-12 h-12 text-content-tertiary mx-auto mb-4" />
            <h3 className="text-heading-sm font-medium text-content-primary mb-2">No networks found</h3>
            <p className="text-body-md text-content-secondary mb-4">
              {searchQuery || driverFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first network to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Network
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-body-sm text-content-secondary">
          Showing {sortedNetworks.length} of {mockNetworks.length} networks
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

      {/* Create Network Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-md font-semibold text-content-primary">Create Network</h2>
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
                <label htmlFor="network-name" className="label">Network Name <span className="text-red-500">*</span></label>
                <input
                  id="network-name"
                  type="text"
                  placeholder="my-network"
                  className="input"
                  autoFocus
                />
                <p className="text-body-xs text-content-tertiary mt-1">Alphanumeric, hyphens, underscores only</p>
              </div>

              <div>
                <label htmlFor="network-driver" className="label">Driver</label>
                <select id="network-driver" className="input">
                  <option value="bridge">bridge</option>
                  <option value="overlay">overlay</option>
                  <option value="macvlan">macvlan</option>
                  <option value="host">host</option>
                  <option value="null">null</option>
                </select>
              </div>

              <div>
                <label htmlFor="network-subnet" className="label">Subnet (CIDR)</label>
                <input
                  id="network-subnet"
                  type="text"
                  placeholder="172.20.0.0/16"
                  className="input"
                />
                <p className="text-body-xs text-content-tertiary mt-1">Leave empty for auto-assignment</p>
              </div>

              <div>
                <label htmlFor="network-gateway" className="label">Gateway</label>
                <input
                  id="network-gateway"
                  type="text"
                  placeholder="172.20.0.1"
                  className="input"
                />
                <p className="text-body-xs text-content-tertiary mt-1">Leave empty for auto-assignment</p>
              </div>

              <div>
                <label htmlFor="network-iprange" className="label">IP Range</label>
                <input
                  id="network-iprange"
                  type="text"
                  placeholder="172.20.0.0/24"
                  className="input"
                />
                <p className="text-body-xs text-content-tertiary mt-1">Optional IP range for container allocation</p>
              </div>

              <div className="space-y-3">
                <label className="label">IPAM Options</label>
                <div className="space-y-2" id="ipam-options-container">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="label">Key</label>
                      <input type="text" placeholder="com.docker.network.bridge.enable_icc" className="input" />
                    </div>
                    <div className="col-span-6">
                      <label className="label">Value</label>
                      <input type="text" placeholder="true" className="input" />
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

              <div className="space-y-3">
                <label className="label">Labels</label>
                <div className="space-y-2" id="labels-container">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="label">Key</label>
                      <input type="text" placeholder="com.example.description" className="input" />
                    </div>
                    <div className="col-span-6">
                      <label className="label">Value</label>
                      <input type="text" placeholder="Production web network" className="input" />
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

              <div className="space-y-3">
                <label className="label">Options</label>
                <div className="space-y-2" id="options-container">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="label">Key</label>
                      <input type="text" placeholder="com.docker.network.bridge.enable_icc" className="input" />
                    </div>
                    <div className="col-span-6">
                      <label className="label">Value</label>
                      <input type="text" placeholder="true" className="input" />
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Create Network
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Detail Modal */}
      {selectedNetwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in" onClick={() => setSelectedNetwork(null)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                  selectedNetwork.runtime === 'docker' && 'bg-blue-100 dark:bg-blue-900/30',
                  selectedNetwork.runtime === 'containerd' && 'bg-purple-100 dark:bg-purple-900/30',
                  selectedNetwork.runtime === 'wasm' && 'bg-green-100 dark:bg-green-900/30'
                )}>
                  <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-heading-md font-semibold text-content-primary">{selectedNetwork.name}</h2>
                  <p className="text-body-sm text-content-tertiary font-mono">{selectedNetwork.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNetwork(null)}
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
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedNetwork.driver}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Subnet</p>
                  <p className="text-heading-sm font-mono text-content-primary">{selectedNetwork.subnet}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Gateway</p>
                  <p className="text-heading-sm font-mono text-content-primary">{selectedNetwork.gateway}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Scope</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedNetwork.scope}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Containers</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedNetwork.containers}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Created</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedNetwork.created}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Runtime</p>
                  <p className="text-heading-sm font-semibold text-content-primary capitalize">{selectedNetwork.runtime}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="btn-secondary">
                  <LinkIcon className="w-4 h-4" />
                  Inspect
                </button>
                <button className="btn-secondary">
                  <Wifi className="w-4 h-4" />
                  Connect Container
                </button>
                <button className="btn-secondary">
                  <Shield className="w-4 h-4" />
                  Firewall Rules
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