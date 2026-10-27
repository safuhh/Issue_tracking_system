import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { UserRole } from '../store/authSlice';

export const useRBAC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isDeveloper = (): boolean => hasRole('developer');
  const isDevOrAdmin = (): boolean => hasRole('admin', 'developer');
  const isUser = (): boolean => !!user;

  return { hasRole, isAdmin, isDeveloper, isDevOrAdmin, isUser, role: user?.role ?? null };
};

export default useRBAC;
