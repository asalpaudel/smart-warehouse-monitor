import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// hardcoded until the auth endpoint exists on the server
const USERS = { operator: 'warehouse123' }

export const useSession = create(
  persist(
    (set) => ({
      user: null,
      login: (username, password) => {
        if (USERS[username] !== password) return false
        set({ user: { username, role: 'Floor Operator', loginAt: new Date().toISOString() } })
        return true
      },
      logout: () => set({ user: null }),
    }),
    { name: 'swm-session', storage: createJSONStorage(() => sessionStorage) },
  ),
)
