// numbers are placeholders until the stream is wired up
const metrics = [
  { label: 'Avg temperature', value: '4.2', unit: '°C' },
  { label: 'Avg humidity', value: '58', unit: '%' },
  { label: 'Peak vibration', value: '1.8', unit: 'mm/s' },
  { label: 'Active sensors', value: '12', unit: '' },
  { label: 'Critical', value: '0', unit: '' },
]

const events = [
  { time: '14:02:11', sensor: 'sensor-1', zone: 'Cold Storage', type: 'UPDATE', status: 'OK' },
  { time: '14:02:10', sensor: 'sensor-5', zone: 'Loading Bay', type: 'ALERT', status: 'WARN' },
  { time: '14:02:09', sensor: 'sensor-8', zone: 'Aisle A', type: 'UPDATE', status: 'OK' },
]

const statusColor = {
  OK: 'text-ok',
  WARN: 'text-warn',
  CRITICAL: 'text-critical',
}

export default function Overview() {
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted">Live readings from all warehouse zones</p>
        </div>
        <div className="text-sm text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ok" />
          <span className="font-medium text-ink">LIVE</span>
          <span>Last update 14:02:11</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface border border-line rounded-md p-4">
            <div className="text-xs text-muted mb-2">{m.label}</div>
            <div className="text-2xl font-semibold">
              {m.value}
              <span className="text-sm font-normal text-muted ml-1">{m.unit}</span>
            </div>
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
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-2 text-muted">{e.time}</td>
                <td className="px-4 py-2 font-mono text-xs">{e.sensor}</td>
                <td className="px-4 py-2">{e.zone}</td>
                <td className="px-4 py-2">{e.type}</td>
                <td className={`px-4 py-2 font-medium ${statusColor[e.status]}`}>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
