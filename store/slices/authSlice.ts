import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import { getCurrentUser, saveCurrentUser, loginUser as storageLogin, registerUser as storageRegister, logoutUser as storageLogout, updateUser as storageUpdateUser } from '@/lib/storage';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const user = getCurrentUser();
      state.user = user;
      state.isAuthenticated = !!user;
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      saveCurrentUser(action.payload);
    },
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      const user = storageLogin(action.payload.email, action.payload.password);
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
    register: (state, action: PayloadAction<{ name: string; email: string; password: string; phone: string }>) => {
      const user = storageRegister(
        action.payload.name,
        action.payload.email,
        action.payload.password,
        action.payload.phone
      );
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
        saveCurrentUser(user);
      }
    },
    logout: (state) => {
      storageLogout();
      state.user = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<{ name: string; phone: string }>) => {
      if (state.user) {
        const updatedUser = storageUpdateUser(state.user.id, action.payload);
        if (updatedUser) {
          state.user = updatedUser;
        }
      }
    },
  },
});

export const { initializeAuth, setUser, login, register, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
