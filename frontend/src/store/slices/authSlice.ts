import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Matches the backend schema fields
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Guest' | 'Admin';
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null, 
  isAuthenticated: false,
  isInitialized: false, // Prevents layout flashing before checking localStorage
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('tale_user', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tale_user');
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('tale_user');
        if (storedUser) {
          state.user = JSON.parse(storedUser);
          state.isAuthenticated = true;
        }
      }
      state.isInitialized = true;
    }
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
