import { configureStore } from '@reduxjs/toolkit';
import authReducer, { type AuthState } from '../features/auth/store/authSlice';

export interface RootState {
  auth: AuthState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
