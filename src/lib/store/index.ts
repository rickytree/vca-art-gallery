import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useUserStore = create<any>()(
  persist(
    (set, get) => ({
      userRole: 'user',
      setUserRole: (newRole: string) => set({ userRole: newRole }),
    }),
    {
      name: 'v3-user', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
