import { useEffect, useState, useCallback } from 'react'
import { api } from '../api'

// interval should come from settings once that page exists
export function usePolling(path, intervalMs = 10000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async () => {
    try {
      setData(await api(path))
      setUpdatedAt(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [path])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, error, updatedAt, reload: load }
}
