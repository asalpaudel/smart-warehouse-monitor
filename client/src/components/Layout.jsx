import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['/dashboard', 'Overview'],
  ['/analytics', 'Analytics'],
  ['/alerts', 'Alerts'],
  ['/settings', 'Settings'],
  ['/profile', 'Profile'],
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-brand text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/15">
          <div className="font-semibold leading-tight">Smart Warehouse</div>
          <div className="text-xs text-white/60">Sensor Monitor</div>
        </div>
        <nav className="flex-1 py-3">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-5 py-2 text-sm ${isActive ? 'bg-brand-dark font-medium' : 'text-white/80 hover:bg-white/10'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
