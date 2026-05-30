import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@constants/index';
import type { AuthTokens, User } from '@ekatale/types';
import type { RootState } from '../index';

interface AuthState {
  phone: string | null;
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  // Holds verified user+tokens for new users who haven't completed their profile yet.
  // isAuthenticated stays false until FarmerRegister is done.
  pendingRegistration: { user: User; tokens: AuthTokens } | null;
}

const initialState: AuthState = {
  phone: null,
  user: null,
  tokens: null,
  isAuthenticated: false,
  pendingRegistration: null,
};

export const persistTokens = createAsyncThunk(
  'auth/persistTokens',
  async (tokens: AuthTokens) => {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    return tokens;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    otpRequested(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.pendingRegistration = null;
    },
    // Called after OTP for a brand-new user who still needs to complete their profile.
    // Keeps isAuthenticated false so the app stays on the auth stack (FarmerRegister screen).
    registrationPending(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.pendingRegistration = action.payload;
    },
    // Called by FarmerRegisterScreen after the profile API call succeeds.
    // Promotes the pending credentials to a full authenticated session.
    registrationComplete(state) {
      if (state.pendingRegistration) {
        state.user = state.pendingRegistration.user;
        state.tokens = state.pendingRegistration.tokens;
        state.isAuthenticated = true;
        state.pendingRegistration = null;
      }
    },
    loggedOut(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.pendingRegistration = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(persistTokens.fulfilled, (state, action) => {
      state.tokens = action.payload;
    });
  },
});

export const {
  otpRequested,
  loginSuccess,
  registrationPending,
  registrationComplete,
  loggedOut,
} = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectPendingRegistration = (state: RootState) => state.auth.pendingRegistration;
export const selectUserRole = (state: RootState) =>
  state.auth.user?.role ?? state.user.currentUser?.role;

export default authSlice.reducer;
