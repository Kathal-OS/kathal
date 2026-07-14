'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Image,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Trash2,
  Copy,
  Tag,
  Layers,
  RefreshCw,
  X,
  ChevronDown,
  MoreVertical,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

const mockImages = [
  { id: 'sha256:abc123def456ghi789jkl012mno345pqr678stu901', repo: 'nginx', tag: 'alpine', size: '42MB', created: '2 days ago', digest: 'sha256:abc123...', layers: 3, runtime: 'docker' },
  { id: 'sha256:def456ghi789jkl012mno345pqr678stu901vwx234', repo: 'postgres', tag: '15', size: '412MB', created: '1 week ago', digest: 'sha256:def456...', layers: 12, runtime: 'docker' },
  { id: 'sha256:ghi789jkl012mno345pqr678stu901vwx234yza567', repo: 'redis', tag: '7-alpine', size: '33MB', created: '2 weeks ago', digest: 'sha256:ghi789...', layers: 4, runtime: 'docker' },
  { id: 'sha256:jkl012mno345pqr678stu901vwx234yza567bcd890', repo: 'grafana/grafana', tag: '10.2', size: '287MB', created: '3 days ago', digest: 'sha256:jkl012...', layers: 18, runtime: 'docker' },
  { id: 'sha256:mno345pqr678stu901vwx234yza567bcd890efg123', repo: 'prom/prometheus', tag: 'v2.48', size: '189MB', created: '1 week ago', digest: 'sha256:mno345...', layers: 8, runtime: 'docker' },
  { id: 'sha256:pqr678stu901vwx234yza567bcd890efg123hij456', repo: 'portainer/portainer-ce', tag: '2.21', size: '215MB', created: '5 days ago', digest: 'sha256:pqr678...', layers: 10, runtime: 'docker' },
  { id: 'sha256:stu901vwx234yza567bcd890efg123hij456klm789', repo: 'traefik', tag: 'v2.10', size: '87MB', created: '4 days ago', digest: 'sha256:stu901...', layers: 6, runtime: 'docker' },
  { id: 'sha256:vwx234yza567bcd890efg123hij456klm789nop012', repo: 'grafana/loki', tag: '2.9', size: '142MB', created: '6 days ago', digest: 'sha256:vwx234...', layers: 9, runtime: 'docker' },
  { id: 'sha256:yza567bcd890efg123hij456klm789nop012qrs345', repo: 'grafana/promtail', tag: '2.9', size: '42MB', created: '6 days ago', digest: 'sha256:yza567...', layers: 4, runtime: 'docker' },
  { id: 'sha256:bcd890efg123hij456klm789nop012qrs345tuv678', repo: 'gcr.io/cadvisor/cadvisor', tag: 'v0.47', size: '128MB', created: '8 days ago', digest: 'sha256:bcd890...', layers: 11, runtime: 'docker' },
  { id: 'sha256:efg123hij456klm789nop012qrs345tuv678wxy901', repo: 'alpine', tag: 'latest', size: '7.8MB', created: '3 weeks ago', digest: 'sha256:efg123...', layers: 1, runtime: 'docker' },
  { id: 'sha256:hij456klm789nop012qrs345tuv678wxy901zab234', repo: 'ubuntu', tag: '22.04', size: '77MB', created: '2 weeks ago', digest: 'sha256:hij456...', layers: 5, runtime: 'docker' },
  { id: 'sha256:wasm123abc456def789ghi012jkl345mno678pqr901', repo: 'wasm/example', tag: 'v1.0', size: '2.4MB', created: '1 day ago', digest: 'sha256:wasm123...', layers: 1, runtime: 'wasm' },
  { id: 'sha256:wasm456def789ghi012jkl345mno678pqr901stu234', repo: 'wasm/rust-app', tag: 'latest', size: '5.1MB', created: '3 days ago', digest: 'sha256:wasm456...', layers: 1, runtime: 'wasm' },
]

export default function ImagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [runtimeFilter, setRuntimeFilter] = useState<'all' | 'docker' | 'wasm'>('all')
  const [showPullModal, setShowPullModal] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created', direction: 'desc' })

  const filteredImages = mockImages.filter((image) => {
    const matchesSearch = image.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRuntime = runtimeFilter === 'all' || image.runtime === runtimeFilter
    return matchesSearch && matchesRuntime
  })

  const sortedImages = [...filteredImages].sort((a, b) => {
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
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'pull' | 'tag' | 'remove') => {
    const imagesToAct = selectedImages.length > 0
      ? mockImages.filter(c => selectedImages.includes(c.id))
      : filteredImages

    if (action === 'remove') {
      setSelectedImages([])
    }
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
          <h1 className="text-heading-lg font-semibold text-content-primary">Images</h1>
          <p className="text-body-md text-content-secondary mt-1">
            Manage container images across all runtimes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPullModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Pull Image
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
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                aria-label="Search images"
              />
            </div>

            <select
              value={runtimeFilter}
              onChange={(e) => setRuntimeFilter(e.target.value as 'all' | 'docker' | 'wasm')}
              className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Filter by runtime"
            >
              <option value="all">All Runtimes</option>
              <option value="docker">Docker</option>
              <option value="wasm">WASM</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPullModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Pull Image
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
      {selectedImages.length > 0 && (
        <div className="card p-3 mb-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-body-sm text-primary-700 dark:text-primary-300">
                {selectedImages.length} image(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedImages.length === filteredImages.length ? 'Deselect all' : 'Select all visible'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('pull')}
                className="px-3 py-1.5 bg-primary-500 text-white rounded-lg font-medium text-body-xs hover:bg-primary-600 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Pull
              </button>
              <button
                onClick={() => handleBulkAction('tag')}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-medium text-body-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Tag className="w-3 h-3" /> Tag
              </button>
              <button
                onClick={() => handleBulkAction('remove')}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium text-body-xs hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
              <button
                onClick={() => setSelectedImages([])}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Images Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken/50">
                <th className="w-12 py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                    indeterminate={selectedImages.length > 0 && selectedImages.length < filteredImages.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    aria-label="Select all"
                  />
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('repo')}
                >
                  <div className="flex items-center gap-1">
                    Repository
                    {sortConfig.key === 'repo' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('tag')}
                >
                  <div className="flex items-center gap-1">
                    Tag
                    {sortConfig.key === 'tag' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    Image ID
                    {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider hidden lg:table-cell">
                  Runtime
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center gap-1">
                    Size
                    {sortConfig.key === 'size' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider cursor-pointer hover:text-content-primary"
                  onClick={() => handleSort('created')}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortConfig.key === 'created' && (sortConfig.direction === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />)}
                  </div>
                </th>
                <th className="w-48 text-right py-3 px-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedImages.map((image) => (
                <tr
                  key={image.id}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(image.id); }}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                      aria-label={`Select ${image.repo}:${image.tag}`}
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-body-sm text-content-primary">{image.repo}</td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary">{image.tag}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary font-mono">{image.id.slice(0, 12)}</td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary hidden lg:table-cell">
                    <span className={cn('w-2 h-2 rounded-full mr-2', runtimeColors[image.runtime as keyof typeof runtimeColors])} aria-hidden="true" />
                    {image.runtime.charAt(0).toUpperCase() + image.runtime.slice(1)}
                  </td>
                  <td className="py-3 px-4 text-body-sm text-content-secondary font-mono">{image.size}</td>
                  <td className="py-3 px-4 text-body-sm text-content-tertiary">{image.created}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Pull">
                        <Download className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Inspect">
                        <Eye className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Tag">
                        <Tag className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Delete">
                        <Trash2 className="w-4 h-4 text-content-tertiary" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="More options">
                        <MoreVertical className="w-4 h-4 text-content-tertiary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedImages.length === 0 && (
          <div className="p-12 text-center">
            <Image className="w-12 h-12 text-content-tertiary mx-auto mb-4" />
            <h3 className="text-heading-sm font-medium text-content-primary mb-2">No images found</h3>
            <p className="text-body-md text-content-secondary mb-4">
              {searchQuery || runtimeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Pull your first image to get started'}
            </p>
            <button
              onClick={() => setShowPullModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-body-sm hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" />
              Pull Image
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-body-sm text-content-secondary">
          Showing {sortedImages.length} of {mockImages.length} images
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

      {/* Pull Image Modal */}
      {showPullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md animate-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-heading-md font-semibold text-content-primary">Pull Image</h2>
              <button
                onClick={() => setShowPullModal(false)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="pull-image" className="label">Image Name <span className="text-red-500">*</span></label>
                <input
                  id="pull-image"
                  type="text"
                  placeholder="nginx:alpine, postgres:15, redis:7-alpine..."
                  className="input"
                  autoFocus
                />
                <p className="text-body-xs text-content-tertiary mt-1">Enter image name with optional tag (e.g., nginx:alpine)</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="pull-all-tags" className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" />
                <label htmlFor="pull-all-tags" className="text-body-sm text-content-secondary">Pull all tags</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="pull-platform" className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" />
                <label htmlFor="pull-platform" className="text-body-sm text-content-secondary">Specify platform (e.g., linux/amd64, linux/arm64)</label>
              </div>
              <input type="text" placeholder="linux/amd64" className="input" disabled />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setShowPullModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button className="btn-primary">
                  <Download className="w-4 h-4" />
                  Pull Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}