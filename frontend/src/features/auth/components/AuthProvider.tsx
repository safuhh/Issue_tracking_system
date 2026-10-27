import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { authService } from '../services/authService';

interface Props {
  children: React.ReactNode;
}

/**
 * Attempts a silent token refresh on app mount.
 * This restores auth state across page refreshes via the HttpOnly refresh token cookie.
 */
export const AuthProvider: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const data = await authService.refreshToken();
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      } catch {
        // No active or valid refresh session — user will log in normally
        dispatch(clearCredentials());
      }
    };
    silentRefresh();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-slate-600 text-sm font-medium">Restoring session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
