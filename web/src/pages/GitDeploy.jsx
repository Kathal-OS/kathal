import { useState, useEffect } from 'react'
import { apiFetch, apiPost } from '../hooks/useApi'

export default function GitDeploy() {
  const [repos, setRepos] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', branch: 'main', deploy_cmd: '' })
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(null)
  const [history, setHistory] = useState(null)

  useEffect(() => { loadRepos() }, [])

  async function loadRepos() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/v1/git/repos')
      setRepos(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleAdd() {
    try {
      await apiPost('/api/v1/git/repos', form)
      setShowAdd(false)
      setForm({ name: '', url: '', branch: 'main', deploy_cmd: '' })
      loadRepos()
    } catch (e) { alert('Failed: ' + e.message) }
  }

  async function handleDeploy(id) {
    setDeploying(id)
    try {
      const result = await apiFetch(`/api/v1/git/repos/${id}/deploy`, { method: 'POST' })
      alert(result.error ? `Deploy failed: ${result.error}` : `Deploy OK: ${result.commit || 'done'}`)
      loadRepos()
    } catch (e) { alert('Deploy failed: ' + e.message) }
    setDeploying(null)
  }

  async function showHistory(id) {
    try {
      const data = await apiFetch(`/api/v1/git/repos/${id}/history`)
      setHistory({ id, logs: data || [] })
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Git Deployment</h2>
        <button onClick={() => setShowAdd(true)}
          style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer' }}>
          + Add Repository
        </button>
      </div>

      {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
          <p>No repositories configured</p>
          <p style={{ fontSize: 13 }}>Add a GitHub or GitLab repo to enable one-click deployments</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {repos.map(repo => (
            <div key={repo.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{repo.name}</h3>
                <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: 13 }}>{repo.url} ({repo.branch})</p>
                {repo.deploy_cmd && <p style={{ margin: '2px 0', color: '#64748b', fontSize: 12 }}>Deploy: {repo.deploy_cmd}</p>}
                <p style={{ margin: 0, fontSize: 12 }}>
                  Status: <span style={{ color: repo.status === 'success' ? '#22c55e' : repo.status === 'failed' ? '#ef4444' : '#94a3b8' }}>
                    {repo.status || 'idle'}
                  </span>
                  {repo.last_deploy && ` · Last: ${new Date(repo.last_deploy).toLocaleString()}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => showHistory(repo.id)}
                  style={{ padding: '6px 12px', background: '#334155', border: 'none', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                  History
                </button>
                <button onClick={() => handleDeploy(repo.id)} disabled={deploying === repo.id}
                  style={{ padding: '6px 16px', background: deploying === repo.id ? '#1e40af' : '#3b82f6', border: 'none', borderRadius: 6, color: 'white', cursor: deploying === repo.id ? 'wait' : 'pointer', fontSize: 12 }}>
                  {deploying === repo.id ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowAdd(false)}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, width: 420 }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px' }}>Add Repository</h3>
            {[
              { key: 'name', label: 'Name', placeholder: 'my-app' },
              { key: 'url', label: 'Git URL', placeholder: 'https://github.com/user/repo.git' },
              { key: 'branch', label: 'Branch', placeholder: 'main' },
              { key: 'deploy_cmd', label: 'Deploy Command', placeholder: 'docker compose up -d' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                  style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: 'white', fontSize: 13 }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {history && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setHistory(null)}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, width: 500, maxHeight: '70vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px' }}>Deploy History</h3>
            {history.logs.length === 0 ? <p style={{ color: '#64748b' }}>No deployments yet</p> : history.logs.map((log, i) => (
              <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: log.error ? '#ef4444' : '#22c55e' }}>{log.error ? 'FAILED' : 'SUCCESS'}</span>
                  <span style={{ color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                {log.commit && <p style={{ margin: '4px 0', fontSize: 12, color: '#94a3b8' }}>Commit: {log.commit}</p>}
                {log.output && <pre style={{ margin: '4px 0', fontSize: 11, color: '#64748b', whiteSpace: 'pre-wrap' }}>{log.output}</pre>}
              </div>
            ))}
            <button onClick={() => setHistory(null)} style={{ marginTop: 12, padding: '8px 16px', background: '#334155', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
