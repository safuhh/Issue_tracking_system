import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store, RootState } from '../../store';
import { clearCredentials, setCredentials, AuthUser } from '../../features/auth/store/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send HttpOnly cookies (refresh token)
});

// Deduplicated refresh token request promise across callers
let refreshPromise: Promise<{ accessToken: string; user: AuthUser }> | null = null;

/**
 * Restores authentication session via the HttpOnly refreshToken cookie.
 * Deduplicates in-flight refresh requests to prevent race conditions.
 */
export const refreshAuthSession = async (): Promise<{ accessToken: string; user: AuthUser }> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post<{
        success: boolean;
        accessToken?: string;
        user?: AuthUser;
      }>(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      if (!response.data.success || !response.data.accessToken || !response.data.user) {
        store.dispatch(clearCredentials());
        throw new Error('No active session');
      }

      const { accessToken, user } = response.data;
      store.dispatch(setCredentials({ user, accessToken }));
      return { accessToken, user };
    } catch (err) {
      store.dispatch(clearCredentials());
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Track if a refresh is already in progress in response interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else if (token) {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthRoute =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/refresh-token');

    if (!isAuthRoute) {
      const state = store.getState() as RootState;
      const token = state.auth.accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 + silent refresh ────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle 401 (token expired) errors — not for refresh or login endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest._retry = true;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await refreshAuthSession();

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear auth state so ProtectedRoute will handle redirect smoothly
        store.dispatch(clearCredentials());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
