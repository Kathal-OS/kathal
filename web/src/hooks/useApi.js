import { useState, useEffect } from 'react'

const API_BASE = '/api/v1'

function getHeaders() {
  const token = localStorage.getItem('kathal_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function useApi(path, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}${path}`, {
          headers: getHeaders(),
          ...options,
        })

        // Handle 401 (token expired).
        if (res.status === 401) {
          localStorage.removeItem('kathal_token')
          localStorage.removeItem('kathal_user')
          window.location.href = '/login'
          return
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [path])

  return { data, loading, error }
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (res.status === 401) {
    localStorage.removeItem('kathal_token')
    localStorage.removeItem('kathal_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  if (res.status === 401) {
    localStorage.removeItem('kathal_token')
    localStorage.removeItem('kathal_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
