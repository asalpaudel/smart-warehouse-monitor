import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/session'
import { useTelemetry } from '../store/telemetry'
import { useSettings } from '../store/settings'
import { api } from '../api'

export default function Profile() {
  const { user, logout } = useSession()
  const { connected, events, lastUpdate } = useTelemetry()
  const { pollIntervalSec, livePaused } = useSettings()
  const navigate = useNavigate()

  async function signOut() {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // token probably already dead, log out locally anyway
    }
    logout()
    navigate('/login')
  }

  const rows = [
    ['Username', user?.username],
    ['Role', user?.role],
    ['Signed in at', user?.loginAt ? new Date(user.loginAt).toLocaleString('en-GB') : '--'],
    ['Live stream', connected ? 'connected' : livePaused ? 'paused' : 'disconnected'],
    ['Last reading', lastUpdate ? new Date(lastUpdate).toLocaleTimeString('en-GB') : '--'],
    ['Events in buffer', events.length],
    ['Polling every', `${pollIntervalSec}s`],
  ]

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-1">Profile</h1>
      <p className="text-sm text-muted mb-6">Current session</p>

      <div className="bg-surface border border-line rounded-md mb-4">
        <div className="px-5 py-4 border-b border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-semibold uppercase">
            {user?.username?.[0]}
          </div>
          <div>
            <div className="font-medium">{user?.username}</div>
            <div className="text-xs text-muted">{user?.role}</div>
          </div>
        </div>
        <dl className="text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between px-5 py-2.5 border-b border-line last:border-0">
              <dt className="text-muted">{k}</dt>
              <dd className="tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <button onClick={signOut} className="px-4 py-2 rounded text-sm font-medium border border-critical text-critical hover:bg-critical hover:text-white">
        Sign out
      </button>
    </div>
  )
}
