import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useSession = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      expired: false,
      setSession: ({ token, user }) => set({ token, user, expired: false }),
      logout: (expired = false) => set({ token: null, user: null, expired }),
    }),
    { name: 'swm-session', storage: createJSONStorage(() => sessionStorage) },
  ),
)
