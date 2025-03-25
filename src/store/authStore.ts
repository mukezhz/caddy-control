import { User } from '@/schemas/user/user.schema';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  user: User | null;
  accessToken: string | null;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  resetAuthStore: () => void;
};

type AuthStore = AuthState & AuthActions;

const initAuthState: AuthState = {
  user: null,
  accessToken: null
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initAuthState,
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      resetAuthStore: () => set({ ...initAuthState })
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

// for use outside tsx components, e.g. api client
export const getAccessToken = () => useAuthStore.getState().accessToken;
export const resetAuth = () => useAuthStore.getState().resetAuthStore();
