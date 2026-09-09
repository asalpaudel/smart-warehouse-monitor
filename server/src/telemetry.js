import { EventEmitter } from 'node:events'

const ZONES = ['Cold Storage', 'Loading Bay', 'Aisle A', 'Aisle B', 'Packing Floor']

// cold storage runs cold, rest of the floor is room temp
const baseline = {
  'Cold Storage': { temperatureC: 3, humidityPct: 70, vibrationMm: 0.4 },
  'Loading Bay': { temperatureC: 21, humidityPct: 50, vibrationMm: 2.2 },
  'Aisle A': { temperatureC: 19, humidityPct: 48, vibrationMm: 0.8 },
  'Aisle B': { temperatureC: 19, humidityPct: 47, vibrationMm: 0.9 },
  'Packing Floor': { temperatureC: 22, humidityPct: 45, vibrationMm: 1.5 },
}

export const thresholds = {
  temperatureC: { warn: 26, critical: 30 },
  humidityPct: { warn: 75, critical: 85 },
  vibrationMm: { warn: 3, critical: 4.5 },
}

export const sensors = Array.from({ length: 12 }, (_, i) => {
  const zone = ZONES[i % ZONES.length]
  return { sensorId: `sensor-${i + 1}`, zone, ...baseline[zone], status: 'OK' }
})

export const bus = new EventEmitter()
bus.setMaxListeners(50)

// last few minutes of readings, summary endpoint will read from here later
export const history = []
const HISTORY_MS = 3 * 60 * 1000

function drift(value, base, step, spike) {
  let next = value + (Math.random() - 0.5) * step
  if (Math.random() < spike) next += step * 6
  // pull back toward baseline so it doesnt wander off forever
  return next + (base - next) * 0.05
}

function statusFor(s) {
  for (const key of Object.keys(thresholds)) {
    if (s[key] >= thresholds[key].critical) return 'CRITICAL'
  }
  for (const key of Object.keys(thresholds)) {
    if (s[key] >= thresholds[key].warn) return 'WARN'
  }
  return 'OK'
}

function tick() {
  const now = Date.now()
  for (const s of sensors) {
    const base = baseline[s.zone]
    s.temperatureC = drift(s.temperatureC, base.temperatureC, 0.6, 0.02)
    s.humidityPct = drift(s.humidityPct, base.humidityPct, 1.5, 0.02)
    s.vibrationMm = Math.max(0, drift(s.vibrationMm, base.vibrationMm, 0.3, 0.03))

    const prev = s.status
    s.status = statusFor(s)
    const eventType = s.status === prev ? 'UPDATE' : s.status === 'OK' ? 'RECOVERY' : 'ALERT'

    const reading = {
      sensorId: s.sensorId,
      zone: s.zone,
      temperatureC: +s.temperatureC.toFixed(1),
      humidityPct: +s.humidityPct.toFixed(1),
      vibrationMm: +s.vibrationMm.toFixed(2),
      status: s.status,
      eventType,
      timestamp: new Date(now).toISOString(),
    }
    history.push(reading)
    bus.emit('reading', reading)
  }
  while (history.length && now - Date.parse(history[0].timestamp) > HISTORY_MS) history.shift()
}

setInterval(tick, 1000)
