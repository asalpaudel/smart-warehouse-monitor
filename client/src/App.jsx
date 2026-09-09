import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSession } from './store/session'
import { api } from './api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

function RequireAuth() {
  const user = useSession((s) => s.user)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  const token = useSession((s) => s.token)

  useEffect(() => {
    if (token) api('/auth/me').catch(() => {})
  }, [token])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
