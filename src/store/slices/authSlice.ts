import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@api/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('access_token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('access_token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: { payload: { user: User; token: string } }) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Persist to localStorage
      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },

    setUser: (state, action: { payload: User }) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;

      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },

    setLoading: (state, action: { payload: boolean }) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
