'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Layers,
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
  Settings,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  X,
  CheckCircle,
  Square,
  Circle,
  Pause,
  FileText,
  Upload,
  Github,
  Link as LinkIcon,
  Server,
  Database,
  Network as NetworkIcon,
} from 'lucide-react'
import Link from 'next/link'

const mockStacks = [
  {
    id: 'web-stack',
    name: 'Web Application Stack',
    status: 'running',
    services: 4,
    image: 'docker-compose.yml',
    created: '2 days ago',
    updated: '1 hour ago',
    description: 'Nginx + Node.js + PostgreSQL + Redis',
  },
  {
    id: 'monitoring-stack',
    name: 'Monitoring Stack',
    status: 'running',
    services: 5,
    image: 'docker-compose.monitoring.yml',
    created: '5 days ago',
    updated: '30 min ago',
    description: 'Prometheus + Grafana + Alertmanager + Node Exporter + cAdvisor',
  },
  {
    id: 'database-stack',
    name: 'Database Stack',
    status: 'running',
    services: 3,
    image: 'docker-compose.databases.yml',
    created: '1 week ago',
    updated: '2 hours ago',
    description: 'PostgreSQL + MongoDB + Redis with replication',
  },
  {
    id: 'elk-stack',
    name: 'ELK Logging Stack',
    status: 'stopped',
    services: 4,
    image: 'docker-compose.elk.yml',
    created: '3 days ago',
    updated: '1 day ago',
    description: 'Elasticsearch + Logstash + Kibana + Filebeat',
  },
  {
    id: 'ci-cd-stack',
    name: 'CI/CD Pipeline',
    status: 'running',
    services: 6,
    image: 'docker-compose.cicd.yml',
    created: '10 days ago',
    updated: '5 min ago',
    description: 'GitLab + Runner + Registry + Nexus + SonarQube + Portainer',
  },
]

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

export default function ComposePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])
  const [selectedStack, setSelectedStack] = useState<typeof mockStacks[0] | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'updated', direction: 'desc' })

  const filteredStacks = mockStacks.filter((stack) => {
    const matchesSearch = stack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || stack.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedStacks = [...filteredStacks].sort((a, b) => {
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
    if (selectedStacks.length === filteredStacks.length) {
      setSelectedStacks([])
    } else {
      setSelectedStacks(filteredStacks.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedStacks((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'start' | 'stop' | 'restart' | 'remove') => {
    const stacksToAct = selectedStacks.length > 0
      ? mockStacks.filter(c => selectedStacks.includes(c.id))
      : filteredStacks

    if (action === 'remove') {
      setSelectedStacks([])
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-content-primary">Compose Stacks</h1>
          <p className="text-body-md text-content-secondary mt-1">
            Manage multi-container applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeployModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Deploy Stack
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-medium text-body-sm hover:bg-surface-hover/80 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Stack
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
                placeholder="Search stacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                aria-label="Search stacks"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'running' | 'stopped')}
              className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeployModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Deploy Stack
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-medium text-body-sm hover:bg-surface-hover/80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Stack
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
      {selectedStacks.length > 0 && (
        <div className="card p-3 mb-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-body-sm text-primary-700 dark:text-primary-300">
                {selectedStacks.length} stack(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedStacks.length === filteredStacks.length ? 'Deselect all' : 'Select all visible'}
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
                onClick={() => setSelectedStacks([])}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stacks Grid */}
      <div className="card overflow-hidden">
        {sortedStacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedStacks.map((stack) => (
              <div
                key={stack.id}
                className="card-interactive p-5 group relative"
                onClick={() => setSelectedStack(stack)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-content-primary group-hover:text-primary-600 transition-colors">{stack.name}</h3>
                      <p className="text-xs text-content-tertiary font-mono">{stack.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedStacks.includes(stack.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(stack.id); }}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <p className="text-body-sm text-content-secondary mb-4 line-clamp-2">{stack.description}</p>

                <div className="flex items-center gap-4 mb-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Server className="w-4 h-4 text-content-tertiary" />
                    <span className="text-body-sm text-content-secondary">{stack.services} services</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-content-tertiary" />
                    <span className="text-body-sm text-content-secondary">{stack.image}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      statusColors[stack.status as keyof typeof statusColors]
                    )}>
                      <span className="w-2 h-2 rounded-full bg-white/80" aria-hidden="true" />
                      <span className="capitalize">{statusLabels[stack.status as keyof typeof statusLabels] || stack.status}</span>
                    </span>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', 
                      stack.runtime === 'docker' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      stack.runtime === 'wasm' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    )}>
                      {stack.runtime || 'docker'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-content-tertiary">
                    <span>Updated {stack.updated}</span>
                    <span>•</span>
                    <span>Created {stack.created}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="flex-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg font-medium text-body-xs hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
                  >
                    {stack.status === 'running' ? <Stop className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {stack.status === 'running' ? 'Stop' : 'Start'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="px-3 py-1.5 bg-surface-hover border border-border rounded-lg font-medium text-body-xs hover:bg-surface-hover/80 transition-colors flex items-center justify-center gap-1"
                  >
                    <Restart className="w-3 h-3" /> Restart
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-content-tertiary mx-auto mb-4" />
            <h3 className="text-heading-sm font-medium text-content-primary mb-2">No stacks found</h3>
            <p className="text-body-md text-content-secondary mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Deploy your first stack to get started'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowDeployModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Deploy Stack
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-medium text-body-sm hover:bg-surface-hover/80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Stack
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-body-sm text-content-secondary">
          Showing {sortedStacks.length} of {mockStacks.length} stacks
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

      {/* Create Stack Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-md font-semibold text-content-primary">Create New Stack</h2>
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
                <label htmlFor="stack-name" className="label">Stack Name <span className="text-red-500">*</span></label>
                <input
                  id="stack-name"
                  type="text"
                  placeholder="my-awesome-stack"
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Compose File</label>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <FileText className="w-12 h-12 text-content-tertiary mx-auto mb-2" />
                    <p className="text-body-md text-content-secondary">Drag & drop docker-compose.yml or click to browse</p>
                    <input type="file" accept=".yml,.yaml" className="hidden" id="compose-file" />
                    <label htmlFor="compose-file" className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                  </div>
                  <p className="text-body-xs text-content-tertiary">Supports Docker Compose v3.8+</p>
                </div>
              </div>

              <div>
                <label className="label">Environment Variables (.env)</label>
                <div className="space-y-3" id="env-container">
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
                <button className="btn-secondary btn-sm">
                  <Plus className="w-3 h-3" />
                  Add Variable
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Create Stack
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Stack Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-md font-semibold text-content-primary">Deploy Stack</h2>
              <button
                onClick={() => setShowDeployModal(false)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-interactive p-6 text-center md:col-span-1">
                  <Github className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-content-primary mb-1">From Git Repository</h3>
                  <p className="text-body-sm text-content-secondary">Clone and deploy from GitHub, GitLab, or Bitbucket</p>
                </div>
                <div className="card-interactive p-6 text-center md:col-span-1">
                  <Upload className="w-12 h-12 text-success-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-content-primary mb-1">Upload Compose File</h3>
                  <p className="text-body-sm text-content-secondary">Upload docker-compose.yml directly</p>
                </div>
                <div className="card-interactive p-6 text-center md:col-span-1">
                  <LinkIcon className="w-12 h-12 text-info-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-content-primary mb-1">From Template</h3>
                  <p className="text-body-sm text-content-secondary">Use pre-built templates (WordPress, ELK, etc.)</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-heading-sm font-semibold text-content-primary mb-4">Quick Deploy from Git</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="git-url" className="label">Repository URL <span className="text-red-500">*</span></label>
                    <input
                      id="git-url"
                      type="text"
                      placeholder="https://github.com/user/repo.git"
                      className="input"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="git-branch" className="label">Branch</label>
                      <input id="git-branch" type="text" placeholder="main" className="input" defaultValue="main" />
                    </div>
                    <div>
                      <label htmlFor="compose-path" className="label">Compose File Path</label>
                      <input id="compose-path" type="text" placeholder="docker-compose.yml" className="input" defaultValue="docker-compose.yml" />
                    </div>
                    <div>
                      <label htmlFor="deploy-dir" className="label">Deploy Directory</label>
                      <input id="deploy-dir" type="text" placeholder="/opt/stacks/myapp" className="input" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="auto-pull" className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" defaultChecked />
                    <label htmlFor="auto-pull" className="text-body-sm text-content-secondary">Auto-pull latest images</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="auto-restart" className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" defaultChecked />
                    <label htmlFor="auto-restart" className="text-body-sm text-content-secondary">Auto-restart on config change</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowDeployModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button className="btn-primary">
                <Upload className="w-4 h-4" />
                Deploy Stack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stack Detail Modal */}
      {selectedStack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in" onClick={() => setSelectedStack(null)}>
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-heading-md font-semibold text-content-primary">{selectedStack.name}</h2>
                  <p className="text-body-sm text-content-tertiary font-mono">{selectedStack.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStack(null)}
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
                  <p className="text-heading-sm font-semibold text-content-primary capitalize">{selectedStack.status}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Services</p>
                  <p className="text-heading-sm font-semibold text-content-primary">{selectedStack.services}</p>
                </div>
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <p className="text-body-xs text-content-tertiary uppercase tracking-wider">Compose File</p>
                  <p className="text-body-sm font-mono text-content-primary">{selectedStack.image}</p>
                </div>
              </div>

              <div className="p-4 bg-surface-sunken rounded-lg">
                <p className="text-body-xs text-content-tertiary uppercase tracking-wider mb-2">Description</p>
                <p className="text-body-sm text-content-primary">{selectedStack.description}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="btn-secondary">
                  <FileText className="w-4 h-4" />
                  View Config
                </button>
                <button className="btn-secondary">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
                <button className={cn('btn-secondary', selectedStack.status === 'running' ? '' : '')}>
                  {selectedStack.status === 'running' ? <Stop className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {selectedStack.status === 'running' ? 'Stop' : 'Start'}
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