import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type Role = 'CONTRIBUTOR' | 'TEAM_LEAD' | 'MANAGER' | 'ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  teamId?: string;
  team?: string;
  wipLimit: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        axios.post('/api/auth/logout', {}, { withCredentials: true }).catch(() => {});
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
