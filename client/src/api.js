import { useSession } from './store/session'

export async function api(path, options = {}) {
  const token = useSession.getState().token
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (res.status === 401 && token) {
    useSession.getState().logout(true)
    throw new Error('session expired')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || res.statusText)
  }
  return res.status === 204 ? null : res.json()
}
