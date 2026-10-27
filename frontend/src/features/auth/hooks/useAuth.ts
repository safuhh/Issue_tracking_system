import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../../store';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { authService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authService.register({ name, email, password });
    dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  return { user, accessToken, isAuthenticated, isLoading, login, register, logout };
};

export { useRBAC } from './useRBAC';
export default useAuth;
