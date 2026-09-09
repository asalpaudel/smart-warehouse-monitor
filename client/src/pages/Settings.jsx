import { useSettings } from '../store/settings'
import { useTelemetry } from '../store/telemetry'

const thresholdFields = [
  { key: 'temperatureC', label: 'Temperature', unit: '°C', min: 20, max: 35, step: 0.5 },
  { key: 'humidityPct', label: 'Humidity', unit: '%', min: 60, max: 95, step: 1 },
  { key: 'vibrationMm', label: 'Vibration', unit: 'mm/s', min: 2, max: 6, step: 0.1 },
]

export default function Settings() {
  const { pollIntervalSec, livePaused, thresholds, set, setThreshold } = useSettings()
  const connected = useTelemetry((s) => s.connected)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-muted mb-6">Stored in this browser only</p>

      <section className="bg-surface border border-line rounded-md p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Live feed</div>
            <div className="text-xs text-muted">Pause the sensor stream on the overview page</div>
          </div>
          <button
            onClick={() => set({ livePaused: !livePaused })}
            className={`px-3 py-1.5 rounded text-sm font-medium border ${livePaused ? 'bg-brand text-white border-brand' : 'border-line hover:bg-bg'}`}
          >
            {livePaused ? 'Resume' : 'Pause'}
          </button>
        </div>
        <div className="text-xs text-muted mt-3">
          Stream is {connected ? 'connected' : livePaused ? 'paused' : 'disconnected'}
        </div>
      </section>

      <section className="bg-surface border border-line rounded-md p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium text-sm">Polling interval</div>
            <div className="text-xs text-muted">How often analytics and alerts refresh</div>
          </div>
          <div className="text-sm tabular-nums">{pollIntervalSec}s</div>
        </div>
        <input
          type="range"
          min="5"
          max="15"
          step="1"
          value={pollIntervalSec}
          onChange={(e) => set({ pollIntervalSec: Number(e.target.value) })}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-muted mt-1"><span>5s</span><span>15s</span></div>
      </section>

      <section className="bg-surface border border-line rounded-md p-5">
        <div className="font-medium text-sm mb-1">Alert thresholds</div>
        <div className="text-xs text-muted mb-4">Alerts below these values are hidden on the alerts page</div>
        {thresholdFields.map((f) => (
          <div key={f.key} className="mb-4 last:mb-0">
            <div className="flex justify-between text-sm mb-1">
              <span>{f.label}</span>
              <span className="tabular-nums">{thresholds[f.key]}{f.unit}</span>
            </div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={thresholds[f.key]}
              onChange={(e) => setThreshold(f.key, Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>
        ))}
      </section>
    </div>
  )
}
