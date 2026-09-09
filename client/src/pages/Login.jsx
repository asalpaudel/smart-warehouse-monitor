import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/session'
import { api } from '../api'

export default function Login() {
  const { setSession, expired } = useSession()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api('/auth/login', { method: 'POST', body: { username: username.trim(), password } })
      setSession(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-surface border border-line rounded-md p-8">
        <h1 className="text-xl font-semibold">Smart Warehouse Monitor</h1>
        <p className="text-sm text-muted mt-1 mb-6">Sign in to view sensor activity</p>

        {expired && (
          <p className="text-sm bg-warn/10 text-warn border border-warn/30 rounded px-3 py-2 mb-4">
            Your session expired, please sign in again
          </p>
        )}

        <label className="block text-sm mb-1" htmlFor="username">Username</label>
        <input
          id="username"
          className="w-full border border-line rounded px-3 py-2 mb-4 focus:outline-none focus:border-brand"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="block text-sm mb-1" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="w-full border border-line rounded px-3 py-2 mb-4 focus:outline-none focus:border-brand"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="text-sm text-critical mb-3">{error}</p>}

        <button
          disabled={busy}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white rounded py-2 text-sm font-medium"
        >
          {busy ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-xs text-muted mt-5">Demo login: operator / warehouse123</p>
      </form>
    </div>
  )
}
