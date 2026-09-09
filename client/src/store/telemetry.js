import { create } from 'zustand'
import { useSession } from './session'
import { api } from '../api'

const MAX_EVENTS = 60

export const useTelemetry = create((set, get) => ({
  connected: false,
  lastUpdate: null,
  sensors: {},
  events: [],

  connect: () => {
    if (get().source) return
    const token = useSession.getState().token
    const source = new EventSource(`/api/stream/telemetry?token=${token}`)
    source.onopen = () => set({ connected: true })
    source.onerror = () => {
      set({ connected: false })
      // browser hides the status code, so check the session ourselves when the stream closes
      if (source.readyState === EventSource.CLOSED) api('/auth/me').catch(() => {})
    }
    source.onmessage = (e) => {
      const r = JSON.parse(e.data)
      set((s) => ({
        lastUpdate: r.timestamp,
        sensors: { ...s.sensors, [r.sensorId]: r },
        events: [r, ...s.events].slice(0, MAX_EVENTS),
      }))
    }
    set({ source })
  },

  disconnect: () => {
    get().source?.close()
    set({ source: null, connected: false })
  },
}))
