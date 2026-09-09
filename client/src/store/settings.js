import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettings = create(
  persist(
    (set) => ({
      pollIntervalSec: 10,
      livePaused: false,
      // client side floor on top of the server thresholds, hides noisy alerts
      thresholds: { temperatureC: 26, humidityPct: 75, vibrationMm: 3 },
      set: (patch) => set(patch),
      setThreshold: (key, value) => set((s) => ({ thresholds: { ...s.thresholds, [key]: value } })),
    }),
    { name: 'swm-settings' },
  ),
)
