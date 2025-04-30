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

        if (user?.isAdmin) return true;

        if (!user?.role?.permissions || user.role.permissions.length === 0) return false;
        
        const hasExactPermission = user.role.permissions.some(
          (permission) => permission.name === permissionName
        );
        
        if (hasExactPermission) return true;
        
        // If checking for a 'view' permission, check if the user has the corresponding 'manage' permission
        if (permissionName.endsWith(':view')) {
          const resourceName = permissionName.split(':')[0];
          const managePermission = `${resourceName}:manage`;
          
          // Having 'manage' permission implies having 'view' permission for the same resource
          return user.role.permissions.some(
            (permission) => permission.name === managePermission
          );
        }
        
        return false;
      }
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const resetAuth = () => useAuthStore.getState().resetAuthStore();
export const hasPermission = (permissionName: string) => useAuthStore.getState().hasPermission(permissionName);
