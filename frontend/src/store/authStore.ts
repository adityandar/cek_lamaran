import { create } from 'zustand';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  error: null,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return set({ loading: false });
    try {
      const user = await authApi.getMe(token);
      set({ token, user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.accessToken);
      set({ token: data.accessToken, user: data.user });
    } catch (e: unknown) {
      set({ error: (e as Error).message || 'Login failed' });
    }
  },

  register: async (email, password, name) => {
    set({ error: null });
    try {
      const data = await authApi.register(email, password, name);
      localStorage.setItem('token', data.accessToken);
      set({ token: data.accessToken, user: data.user });
    } catch (e: unknown) {
      set({ error: (e as Error).message || 'Register failed' });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
