import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { API_ROUTES } from '@constants/index';
import { get } from '@services/api/client';
import { authApi } from '@services/api/auth.api';
import type { Language, User } from '@ekatale/types';

interface UserState {
  currentUser: User | null;
  language: Language;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: UserState = {
  currentUser: null,
  language: 'en',
  isAuthenticated: false,
  token: null,
};

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async () => {
  return authApi.getProfile();
});

export const fetchFarmerProfile = createAsyncThunk('user/fetchFarmerProfile', async () => {
  return get<Partial<User>>(API_ROUTES.FARMER_PROFILE);
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setLanguagePreference(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    logout(state) {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchFarmerProfile.fulfilled, (state, action) => {
        state.currentUser = {
          ...(state.currentUser ?? ({} as User)),
          ...action.payload,
        } as User;
      });
  },
});

export const { setUser, setToken, setLanguagePreference, logout } = userSlice.actions;

export const selectLanguage = (state: RootState) => state.user.language;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserProfile = selectCurrentUser;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;

export default userSlice.reducer;
