import { useMemo, useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { useTelemetry } from '../store/telemetry'
import { useSettings } from '../store/settings'

const severityColor = { WARN: 'text-warn', CRITICAL: 'text-critical' }
const metricLabel = { temperatureC: 'Temperature', humidityPct: 'Humidity', vibrationMm: 'Vibration' }
const metricUnit = { temperatureC: '°C', humidityPct: '%', vibrationMm: 'mm/s' }

function clock(iso) {
  return new Date(iso).toLocaleTimeString('en-GB')
}

export default function Alerts() {
  const { data, error, updatedAt } = usePolling('/dashboard/alerts')
  const events = useTelemetry((s) => s.events)
  const thresholds = useSettings((s) => s.thresholds)

  const [zone, setZone] = useState('')
  const [severity, setSeverity] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'lastSeen', dir: -1 })
  const [selected, setSelected] = useState(null)

  const alerts = data?.alerts ?? []
  const zones = useMemo(() => [...new Set(alerts.map((a) => a.zone))].sort(), [alerts])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return alerts
      .filter((a) => a.value >= thresholds[a.metric])
      .filter((a) => !zone || a.zone === zone)
      .filter((a) => !severity || a.severity === severity)
      .filter((a) => !q || a.sensorId.toLowerCase().includes(q) || a.zone.toLowerCase().includes(q))
      .sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * sort.dir)
  }, [alerts, thresholds, zone, severity, query, sort])

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }))
  }

  const th = (key, label) => (
    <th className="px-4 py-2 font-medium cursor-pointer select-none hover:text-ink" onClick={() => toggleSort(key)}>
      {label}{sort.key === key ? (sort.dir > 0 ? ' ↑' : ' ↓') : ''}
    </th>
  )

  const history = selected ? events.filter((e) => e.sensorId === selected.sensorId).slice(0, 10) : []

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <p className="text-sm text-muted">Sensors that crossed a threshold in the last few minutes</p>
        </div>
        <div className="text-sm text-muted">
          Last updated {updatedAt ? updatedAt.toLocaleTimeString('en-GB') : '--:--:--'}
        </div>
      </div>

      {error && <p className="text-sm text-critical mb-4">Could not load alerts: {error}</p>}

      <div className="flex gap-3 mb-4">
        <input
          className="border border-line rounded px-3 py-1.5 text-sm bg-surface w-56 focus:outline-none focus:border-brand"
          placeholder="Search sensor or zone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="border border-line rounded px-2 py-1.5 text-sm bg-surface" value={zone} onChange={(e) => setZone(e.target.value)}>
          <option value="">All zones</option>
          {zones.map((z) => <option key={z}>{z}</option>)}
        </select>
        <select className="border border-line rounded px-2 py-1.5 text-sm bg-surface" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          <option>WARN</option>
          <option>CRITICAL</option>
        </select>
        <span className="text-sm text-muted self-center ml-auto">{rows.length} of {alerts.length}</span>
      </div>

      <div className="bg-surface border border-line rounded-md">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              {th('severity', 'Severity')}
              {th('sensorId', 'Sensor')}
              {th('zone', 'Zone')}
              {th('metric', 'Metric')}
              {th('value', 'Value')}
              <th className="px-4 py-2 font-medium">Threshold</th>
              {th('firstSeen', 'First seen')}
              {th('lastSeen', 'Last seen')}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-line hover:bg-bg cursor-pointer" onClick={() => setSelected(a)}>
                <td className={`px-4 py-2 font-medium ${severityColor[a.severity]}`}>{a.severity}</td>
                <td className="px-4 py-2 font-mono text-xs">{a.sensorId}</td>
                <td className="px-4 py-2">{a.zone}</td>
                <td className="px-4 py-2">{metricLabel[a.metric]}</td>
                <td className="px-4 py-2 tabular-nums">{a.value}{metricUnit[a.metric]}</td>
                <td className="px-4 py-2 tabular-nums text-muted">{a.threshold}{metricUnit[a.metric]}</td>
                <td className="px-4 py-2 tabular-nums text-muted">{clock(a.firstSeen)}</td>
                <td className="px-4 py-2 tabular-nums text-muted">{clock(a.lastSeen)}</td>
              </tr>
            ))}
            {data && !rows.length && (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-muted">No alerts match</td></tr>
            )}
            {!data && !error && (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-muted">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-96 h-full bg-surface border-l border-line p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-sm">{selected.sensorId}</div>
                <div className="text-sm text-muted">{selected.zone}</div>
              </div>
              <button className="text-muted hover:text-ink text-xl leading-none" onClick={() => setSelected(null)}>×</button>
            </div>

            <dl className="text-sm grid grid-cols-2 gap-y-2 mb-6">
              <dt className="text-muted">Severity</dt>
              <dd className={`font-medium ${severityColor[selected.severity]}`}>{selected.severity}</dd>
              <dt className="text-muted">Metric</dt>
              <dd>{metricLabel[selected.metric]}</dd>
              <dt className="text-muted">Current</dt>
              <dd className="tabular-nums">{selected.value}{metricUnit[selected.metric]}</dd>
              <dt className="text-muted">Threshold</dt>
              <dd className="tabular-nums">{selected.threshold}{metricUnit[selected.metric]}</dd>
              <dt className="text-muted">First seen</dt>
              <dd className="tabular-nums">{clock(selected.firstSeen)}</dd>
              <dt className="text-muted">Last seen</dt>
              <dd className="tabular-nums">{clock(selected.lastSeen)}</dd>
            </dl>

            <div className="text-sm font-medium mb-2">Recent readings</div>
            {history.length ? (
              <table className="w-full text-xs">
                <thead className="text-left text-muted">
                  <tr>
                    <th className="py-1 font-medium">Time</th>
                    <th className="py-1 font-medium">Temp</th>
                    <th className="py-1 font-medium">Hum</th>
                    <th className="py-1 font-medium">Vib</th>
                    <th className="py-1 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((e) => (
                    <tr key={e.timestamp} className="border-t border-line tabular-nums">
                      <td className="py-1 text-muted">{clock(e.timestamp)}</td>
                      <td className="py-1">{e.temperatureC}</td>
                      <td className="py-1">{e.humidityPct}</td>
                      <td className="py-1">{e.vibrationMm}</td>
                      <td className={`py-1 ${e.status === 'OK' ? 'text-ok' : severityColor[e.status]}`}>{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-muted">Nothing from this sensor in the live buffer yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
