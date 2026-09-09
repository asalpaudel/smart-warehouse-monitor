import { Router } from 'express'
import { requireAuth } from './auth.js'
import { history, sensors } from './telemetry.js'

const WINDOW_MS = 60 * 1000
const startedAt = Date.now()

export const dashboard = Router()
dashboard.use(requireAuth)

function zoneStats(readings) {
  const byZone = {}
  for (const r of readings) {
    const z = (byZone[r.zone] ||= { n: 0, t: 0, h: 0, v: 0, ids: new Set(), statusCounts: { OK: 0, WARN: 0, CRITICAL: 0 } })
    z.n++
    z.t += r.temperatureC
    z.h += r.humidityPct
    z.v += r.vibrationMm
    z.ids.add(r.sensorId)
    z.statusCounts[r.status]++
  }
  return byZone
}

dashboard.get('/summary', (req, res) => {
  const now = Date.now()
  const current = history.filter((r) => now - Date.parse(r.timestamp) <= WINDOW_MS)
  const previous = history.filter((r) => {
    const age = now - Date.parse(r.timestamp)
    return age > WINDOW_MS && age <= WINDOW_MS * 2
  })

  const cur = zoneStats(current)
  const prev = zoneStats(previous)

  const zones = Object.keys(cur).map((zone) => {
    const c = cur[zone]
    const p = prev[zone]
    const avg = (s) => ({ t: s.t / s.n, h: s.h / s.n, v: s.v / s.n })
    const a = avg(c)
    const b = p ? avg(p) : null
    return {
      zone,
      sensors: c.ids.size,
      avgTemperatureC: +a.t.toFixed(1),
      avgHumidityPct: +a.h.toFixed(1),
      avgVibrationMm: +a.v.toFixed(2),
      delta: {
        temperatureC: b ? +(a.t - b.t).toFixed(1) : null,
        humidityPct: b ? +(a.h - b.h).toFixed(1) : null,
        vibrationMm: b ? +(a.v - b.v).toFixed(2) : null,
      },
      statusCounts: c.statusCounts,
    }
  })

  res.json({
    windowSec: WINDOW_MS / 1000,
    generatedAt: new Date(now).toISOString(),
    uptimeSec: Math.floor((now - startedAt) / 1000),
    totalReadings: current.length,
    sensorCount: sensors.length,
    zones,
  })
})
