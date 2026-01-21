import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Thunk para obtener sesión actual
export const getCurrentSession = createAsyncThunk(
  'auth/getCurrentSession',
  async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }
);

// Thunk para login con email
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }
);

// Thunk para registro con email
export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });
    if (error) throw error;
    return data;
  }
);

// Thunk para logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
);

// Thunk para login con Google
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // getCurrentSession
    builder
      .addCase(getCurrentSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || null;
        state.isAuthenticated = !!action.payload?.user;
      })
      .addCase(getCurrentSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // loginWithEmail
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al iniciar sesión';
      });

    // registerWithEmail
    builder
      .addCase(registerWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        // Si la confirmación de email está habilitada, el usuario no estará autenticado inmediatamente
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.error = null;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al registrarse';
      });

    // logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cerrar sesión';
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
