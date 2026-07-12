import { useState, useEffect } from 'react'
import { useApi, apiPost, apiDelete } from '../hooks/useApi'

function ContainerRow({ container, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState(null)
  const isRunning = container.state === 'running'

  async function action(type) {
    setLoading(true)
    try {
      if (type === 'delete') {
        if (!confirm(`Delete container ${container.name}?`)) return
        await apiDelete(`/containers/${container.id}/delete`)
      } else {
        await apiPost(`/containers/${container.id}/${type}`)
      }
      onRefresh()
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function showLogs() {
    try {
      const res = await fetch(`/api/v1/containers/${container.id}/logs`)
      const data = await res.json()
      setLogs(data.logs)
    } catch (err) {
      alert(`Logs error: ${err.message}`)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <div>
            <h3 className="font-semibold text-lg">{container.name}</h3>
            <p className="text-sm text-gray-500">{container.image}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {container.ports?.map((p, i) => (
            <a
              key={i}
              href={`http://localhost:${p.hostPort}`}
              target="_blank"
              rel="noopener"
              className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              :{p.hostPort}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-2">{container.status}</span>

        {isRunning ? (
          <>
            <button
              onClick={() => action('stop')}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
            >
              ⏹ Stop
            </button>
            <button
              onClick={() => action('restart')}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors disabled:opacity-50"
            >
              🔄 Restart
            </button>
          </>
        ) : (
          <button
            onClick={() => action('start')}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
          >
            ▶ Start
          </button>
        )}

        <button
          onClick={showLogs}
          className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          📋 Logs
        </button>

        <button
          onClick={() => action('delete')}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-gray-800 text-gray-500 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          🗑️
        </button>
      </div>

      {/* Logs modal */}
      {logs && (
        <div className="mt-4 bg-gray-950 rounded-lg p-4 max-h-64 overflow-auto font-mono text-xs text-gray-400">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Logs (last 100 lines)</span>
            <button onClick={() => setLogs(null)} className="text-gray-600 hover:text-gray-400">✕</button>
          </div>
          <pre className="whitespace-pre-wrap">{logs}</pre>
        </div>
      )}
    </div>
  )
}

export default function Containers() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: containers, loading } = useApi('/containers?all=true')

  function refresh() {
    setRefreshKey(k => k + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-lg">Loading containers...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Containers</h2>
          <p className="text-gray-500 mt-1">{containers?.length || 0} containers total</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-kathal-600 text-white rounded-lg hover:bg-kathal-700 transition-colors text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {!containers || containers.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🐳</span>
          <h3 className="text-xl font-semibold text-gray-400">No containers</h3>
          <p className="text-gray-600 mt-2">Docker containers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {containers.map(c => (
            <ContainerRow key={c.id} container={c} onRefresh={refresh} />
          ))}
        </div>
      )}
    </div>
  )
}
