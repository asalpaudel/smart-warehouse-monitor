import { motion } from 'framer-motion'
import { useTelemetry } from '../store/telemetry'
import { useSettings } from '../store/settings'

const statusColor = {
  OK: 'text-ok',
  WARN: 'text-warn',
  CRITICAL: 'text-critical',
}

function avg(list, key) {
  if (!list.length) return 0
  return list.reduce((a, s) => a + s[key], 0) / list.length
}

function clock(iso) {
  return iso ? new Date(iso).toLocaleTimeString('en-GB') : '--:--:--'
}

export default function Overview() {
  const { sensors, events, lastUpdate, connected } = useTelemetry()
  const livePaused = useSettings((s) => s.livePaused)
  const list = Object.values(sensors)

  const metrics = [
    { label: 'Avg temperature', value: avg(list, 'temperatureC').toFixed(1), unit: '°C' },
    { label: 'Avg humidity', value: avg(list, 'humidityPct').toFixed(0), unit: '%' },
    { label: 'Peak vibration', value: Math.max(0, ...list.map((s) => s.vibrationMm)).toFixed(2), unit: 'mm/s' },
    { label: 'Active sensors', value: list.length, unit: '' },
    { label: 'Critical', value: list.filter((s) => s.status === 'CRITICAL').length, unit: '' },
  ]

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted">Live readings from all warehouse zones</p>
        </div>
        <div className="text-sm text-muted flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-ok animate-pulse' : livePaused ? 'bg-warn' : 'bg-critical'}`} />
          <span className="font-medium text-ink">{connected ? 'LIVE' : livePaused ? 'PAUSED' : 'OFFLINE'}</span>
          <span>Last update {clock(lastUpdate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface border border-line rounded-md p-4 transition hover:border-brand/40 hover:shadow-sm">
            <div className="text-xs text-muted mb-2">{m.label}</div>
            <motion.div
              key={m.value}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold tabular-nums"
            >
              {m.value}
              <span className="text-sm font-normal text-muted ml-1">{m.unit}</span>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-line rounded-md">
        <div className="px-4 py-3 border-b border-line text-sm font-medium">Recent events</div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Sensor</th>
              <th className="px-4 py-2 font-medium">Zone</th>
              <th className="px-4 py-2 font-medium">Temp</th>
              <th className="px-4 py-2 font-medium">Humidity</th>
              <th className="px-4 py-2 font-medium">Vibration</th>
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 15).map((e, i) => (
              <motion.tr
                key={e.sensorId + e.timestamp + i}
                initial={{ opacity: 0, backgroundColor: '#f4f5f7' }}
                animate={{ opacity: 1, backgroundColor: '#ffffff' }}
                transition={{ duration: 0.6 }}
                className="border-t border-line"
              >
                <td className="px-4 py-2 text-muted tabular-nums">{clock(e.timestamp)}</td>
                <td className="px-4 py-2 font-mono text-xs">{e.sensorId}</td>
                <td className="px-4 py-2">{e.zone}</td>
                <td className="px-4 py-2 tabular-nums">{e.temperatureC}°C</td>
                <td className="px-4 py-2 tabular-nums">{e.humidityPct}%</td>
                <td className="px-4 py-2 tabular-nums">{e.vibrationMm}</td>
                <td className="px-4 py-2">{e.eventType}</td>
                <td className={`px-4 py-2 font-medium ${statusColor[e.status]}`}>{e.status}</td>
              </motion.tr>
            ))}
            {!events.length && (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-muted">Waiting for readings...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
