import {  User } from '@/schemas/user/user.schema';
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
  hasPermission: (permissionName: string) => boolean;
};

type AuthStore = AuthState & AuthActions;

const initAuthState: AuthState = {
  user: null,
  accessToken: null
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initAuthState,
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      resetAuthStore: () => set({ ...initAuthState }),
      hasPermission: (permissionName) => {
        const { user } = get();

        // Admin users have all permissions
        if (user?.isAdmin) return true;

        if (!user?.role?.permissions || user.role.permissions.length === 0) return false;
        // Check if user has the specified permission
        console.log("checking permission", permissionName);
        console.log("user permissions", user.role.permissions);
        return !!user.role.permissions.some(
          (permission) => permission.name === permissionName
        );
      }
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
export const hasPermission = (permissionName: string) => useAuthStore.getState().hasPermission(permissionName);
