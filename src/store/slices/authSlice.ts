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
}

const initialState: AuthState = {
  phone: null,
  user: null,
  tokens: null,
  isAuthenticated: false,
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
    },
    loggedOut(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(persistTokens.fulfilled, (state, action) => {
      state.tokens = action.payload;
    });
  },
});

export const { otpRequested, loginSuccess, loggedOut } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUserRole = (state: RootState) =>
  state.auth.user?.role ?? state.user.currentUser?.role;

export default authSlice.reducer;
