import { useState, useEffect } from 'react'
import { apiFetch, apiPost } from '../hooks/useApi'

const CATEGORY_LABELS = {
  databases: { icon: '🗄️', label: 'Databases' },
  webservers: { icon: '🌐', label: 'Web Servers' },
  cms: { icon: '📝', label: 'CMS' },
  devtools: { icon: '🛠️', label: 'Dev Tools' },
  monitoring: { icon: '📊', label: 'Monitoring' },
  media: { icon: '🎬', label: 'Media' },
  networking: { icon: '🔒', label: 'Networking' },
  ai: { icon: '🤖', label: 'AI / LLM' },
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState({})
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [filterCat, search])

  async function loadData() {
    setLoading(true)
    try {
      const url = search
        ? `/api/v1/templates/search?q=${encodeURIComponent(search)}`
        : filterCat
        ? `/api/v1/templates?category=${filterCat}`
        : '/api/v1/templates'
      const data = await apiFetch(url)
      setTemplates(data || [])
      const cats = await apiFetch('/api/v1/templates/categories')
      setCategories(cats || {})
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const totalTemplates = Object.values(categories).reduce((a, b) => a + b, 0)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>Service Templates</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>{totalTemplates} one-click deployments</p>
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: 'white', width: 240 }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setFilterCat(''); setSearch('') }}
          style={{ ...tabStyle, background: !filterCat ? '#3b82f6' : '#1e293b' }}
        >All ({totalTemplates})</button>
        {Object.entries(CATEGORY_LABELS).map(([key, { icon, label }]) => categories[key] ? (
          <button
            key={key}
            onClick={() => { setFilterCat(key); setSearch('') }}
            style={{ ...tabStyle, background: filterCat === key ? '#3b82f6' : '#1e293b' }}
          >{icon} {label} ({categories[key]})</button>
        ) : null)}
      </div>

      {/* Template Grid */}
      {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {templates.map(t => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
                padding: 20, cursor: 'pointer', transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{t.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{t.name}</h3>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {CATEGORY_LABELS[t.category]?.label || t.category}
                  </span>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>{t.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.tags?.slice(0, 3).map(tag => (
                  <span key={tag} style={{ background: '#0f172a', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#94a3b8' }}>{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>v{t.version}</span>
                <span style={{ fontSize: 11, color: t.difficulty === 'easy' ? '#22c55e' : t.difficulty === 'medium' ? '#eab308' : '#ef4444' }}>
                  {t.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, maxWidth: 500, width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>{selected.icon}</span>
              <div>
                <h2 style={{ margin: 0 }}>{selected.name}</h2>
                <span style={{ color: '#94a3b8' }}>{selected.description}</span>
              </div>
            </div>

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Configuration</div>
              <div style={{ fontSize: 13 }}><b>Image:</b> {selected.image}</div>
              {selected.ports?.length > 0 && <div style={{ fontSize: 13 }}><b>Ports:</b> {selected.ports.join(', ')}</div>}
              {selected.volumes?.length > 0 && <div style={{ fontSize: 13 }}><b>Volumes:</b> {selected.volumes.join(', ')}</div>}
              {selected.env_vars?.length > 0 && <div style={{ fontSize: 13 }}><b>Env:</b> {selected.env_vars.join(', ')}</div>}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {selected.website && (
                <a href={selected.website} target="_blank" rel="noopener"
                  style={{ padding: '8px 16px', background: '#334155', borderRadius: 6, color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>
                  Website
                </a>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 13 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const tabStyle = {
  padding: '6px 12px', border: '1px solid #334155', borderRadius: 6,
  color: 'white', cursor: 'pointer', fontSize: 13, background: '#1e293b'
}
