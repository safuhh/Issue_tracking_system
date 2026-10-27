import React, { useState, useEffect } from 'react';
import PasswordInput from '../../auth/components/PasswordInput';
import { authService, AdminUser } from '../../auth/services/authService';

interface EditUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onUserUpdated: (updatedUser: AdminUser) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onUserUpdated,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'developer'>('user');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPassword('');
      setConfirmPassword('');
      setRole(user.role === 'developer' ? 'developer' : 'user');
      setError(null);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    const emailChanged = trimmedEmail !== (user.email || '').toLowerCase();
    const hasPassword = Boolean(password);
    const roleChanged = role !== user.role;

    if (!emailChanged && !hasPassword && !roleChanged) {
      setError('Please provide a new email address, password, or role to update.');
      return;
    }

    setIsUpdating(true);

    try {
      const targetId = user._id || user.id;
      if (!targetId) {
        setError('User ID is missing.');
        return;
      }

      const payload: {
        email?: string;
        password?: string;
        confirmPassword?: string;
        role?: 'user' | 'developer';
      } = {};

      if (emailChanged) {
        payload.email = trimmedEmail;
      }
      if (hasPassword) {
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }
      if (roleChanged) {
        payload.role = role;
      }

      const response = await authService.updateUser(targetId, payload);
      onUserUpdated(response.user);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(', ')
          : 'Failed to update user.');
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="edit-user-modal-overlay"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Update User Account</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-medium">{user.name}</span>
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[11px] font-medium ${
                  user.role === 'admin'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : user.role === 'developer'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-semibold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edit-user-email">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
              id="edit-user-email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edit-user-role">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'developer')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 transition-colors bg-white"
              id="edit-user-role"
            >
              <option value="user">User (Standard Access)</option>
              <option value="developer">Developer (Portal Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edit-user-password">
              New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
              id="edit-user-password"
            />
          </div>

          {password && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edit-user-confirm-password">
                Confirm New Password
              </label>
              <PasswordInput
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
                id="edit-user-confirm-password"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              id="edit-user-save-btn"
            >
              {isUpdating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
