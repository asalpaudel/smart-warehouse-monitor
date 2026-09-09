import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { usePolling } from '../hooks/usePolling'

const metrics = [
  { key: 'avgTemperatureC', delta: 'temperatureC', label: 'Avg temperature', unit: '°C', color: '#1f4e79' },
  { key: 'avgHumidityPct', delta: 'humidityPct', label: 'Avg humidity', unit: '%', color: '#2e7d32' },
  { key: 'avgVibrationMm', delta: 'vibrationMm', label: 'Avg vibration', unit: 'mm/s', color: '#c77700' },
]

function Delta({ value, unit }) {
  if (value == null) return <span className="text-muted">--</span>
  const up = value > 0
  const cls = Math.abs(value) < 0.05 ? 'text-muted' : up ? 'text-warn' : 'text-ok'
  return (
    <span className={`${cls} tabular-nums`}>
      {up ? '+' : ''}{value.toFixed(1)}{unit}
    </span>
  )
}

export default function Analytics() {
  const { data, error, updatedAt } = usePolling('/dashboard/summary')

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted">Per-zone averages over the last {data?.windowSec ?? 60}s, compared to the window before</p>
        </div>
        <div className="text-sm text-muted">
          Last updated {updatedAt ? updatedAt.toLocaleTimeString('en-GB') : '--:--:--'}
        </div>
      </div>

      {error && <p className="text-sm text-critical mb-4">Could not load summary: {error}</p>}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-line rounded-md p-4 transition hover:border-brand/40 hover:shadow-sm">
          <div className="text-xs text-muted mb-2">Readings in window</div>
          <div className="text-2xl font-semibold tabular-nums">{data?.totalReadings ?? '--'}</div>
        </div>
        <div className="bg-surface border border-line rounded-md p-4 transition hover:border-brand/40 hover:shadow-sm">
          <div className="text-xs text-muted mb-2">Server uptime</div>
          <div className="text-2xl font-semibold tabular-nums">{data ? Math.floor(data.uptimeSec / 60) : '--'}<span className="text-sm font-normal text-muted ml-1">min</span></div>
        </div>
        <div className="bg-surface border border-line rounded-md p-4 transition hover:border-brand/40 hover:shadow-sm">
          <div className="text-xs text-muted mb-2">Zones reporting</div>
          <div className="text-2xl font-semibold tabular-nums">{data?.zones.length ?? '--'}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.key} className="bg-surface border border-line rounded-md p-4 transition hover:border-brand/40 hover:shadow-sm">
            <div className="text-sm font-medium mb-3">{m.label}</div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={data?.zones ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e5ea" />
                  <XAxis dataKey="zone" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v}${m.unit}`} cursor={{ fill: '#f4f5f7' }} />
                  <Bar dataKey={m.key} fill={m.color} radius={[2, 2, 0, 0]} animationDuration={400} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-line rounded-md">
        <div className="px-4 py-3 border-b border-line text-sm font-medium">Trend vs previous window</div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Zone</th>
              <th className="px-4 py-2 font-medium">Sensors</th>
              {metrics.map((m) => <th key={m.key} className="px-4 py-2 font-medium">{m.label}</th>)}
              <th className="px-4 py-2 font-medium">Warn</th>
              <th className="px-4 py-2 font-medium">Critical</th>
            </tr>
          </thead>
          <tbody>
            {(data?.zones ?? []).map((z) => (
              <tr key={z.zone} className="border-t border-line">
                <td className="px-4 py-2">{z.zone}</td>
                <td className="px-4 py-2 tabular-nums">{z.sensors}</td>
                {metrics.map((m) => (
                  <td key={m.key} className="px-4 py-2 tabular-nums">
                    {z[m.key]}{m.unit} <span className="text-xs ml-1"><Delta value={z.delta[m.delta]} unit={m.unit} /></span>
                  </td>
                ))}
                <td className="px-4 py-2 tabular-nums text-warn">{z.statusCounts.WARN}</td>
                <td className="px-4 py-2 tabular-nums text-critical">{z.statusCounts.CRITICAL}</td>
              </tr>
            ))}
            {!data && !error && (
              <tr><td colSpan="7" className="px-4 py-6 text-center text-muted">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
