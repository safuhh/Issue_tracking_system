import React, { useState } from 'react';
import PasswordInput from '../../auth/components/PasswordInput';
import { authService, AdminUser } from '../../auth/services/authService';

interface CreateUserFormProps {
  onUserCreated: (newUser: AdminUser) => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'developer'>('user');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    // Client-side validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setCreateError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    setIsCreating(true);

    try {
      const response = await authService.createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
      });

      setCreateSuccess(`User "${response.user.name}" (${response.user.email}) created successfully as ${response.user.role}!`);

      // Reset form fields
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('user');

      // Notify parent to update user list
      onUserCreated(response.user);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(', ')
          : 'Failed to create user.');
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="mt-6 border border-slate-200 rounded-lg p-5 bg-white">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Create New User</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Add a new account directly to the system with either User or Developer permissions.
        </p>
      </div>

      {createSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{createSuccess}</span>
          <button
            type="button"
            onClick={() => setCreateSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {createError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{createError}</span>
          <button
            type="button"
            onClick={() => setCreateError(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-semibold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="create-user-name">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
            id="create-user-name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="create-user-email">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
            id="create-user-email"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="create-user-role">
            Assigned Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'developer')}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 transition-colors bg-white"
            id="create-user-role"
          >
            <option value="user">User (Standard Access)</option>
            <option value="developer">Developer (Portal Access)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="create-user-password">
            Password
          </label>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
            id="create-user-password"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="create-user-confirm-password">
            Confirm Password
          </label>
          <PasswordInput
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
            id="create-user-confirm-password"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-1.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 h-[34px]"
            id="create-user-submit-btn"
          >
            {isCreating ? 'Creating User...' : 'Create Account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateUserForm;
