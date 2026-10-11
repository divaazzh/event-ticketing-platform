import { create } from 'zustand';
import apiClient from '@/services/api';
import { User, UserRole } from '@/types';

interface AuthResponse {
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null, token?: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('ticketflow_token'),
  isAuthenticated: !!localStorage.getItem('ticketflow_token'),
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    const token = localStorage.getItem('ticketflow_token');
    const savedUser = localStorage.getItem('ticketflow_user');

    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    if (savedUser) {
      try {
        set({ user: JSON.parse(savedUser), isAuthenticated: true });
      } catch {
        // Ignore parse error
      }
    }

    try {
      const response = await apiClient.get<{ data: User }>('/auth/me');
      const user = response.data.data;
      localStorage.setItem('ticketflow_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      localStorage.removeItem('ticketflow_token');
      localStorage.removeItem('ticketflow_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      const { user, access_token } = response.data.data;

      localStorage.setItem('ticketflow_token', access_token);
      localStorage.setItem('ticketflow_user', JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      const { user, access_token } = response.data.data;

      localStorage.setItem('ticketflow_token', access_token);
      localStorage.setItem('ticketflow_user', JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      if (get().token) {
        await apiClient.post('/auth/logout');
      }
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('ticketflow_token');
      localStorage.removeItem('ticketflow_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  setUser: (user, token = null) => {
    if (token) {
      localStorage.setItem('ticketflow_token', token);
    }
    if (user) {
      localStorage.setItem('ticketflow_user', JSON.stringify(user));
    }
    set({
      user,
      token: token || get().token,
      isAuthenticated: !!(user && (token || get().token)),
    });
  },

  clearError: () => set({ error: null }),
}));
