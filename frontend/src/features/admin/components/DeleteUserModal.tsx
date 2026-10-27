import React, { useState } from 'react';
import { authService, AdminUser } from '../../auth/services/authService';

interface DeleteUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onUserDeleted: (userId: string) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  onClose,
  onUserDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleDelete = async () => {
    const targetId = user._id || user.id;
    if (!targetId) {
      setError('User ID is missing.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await authService.deleteUser(targetId);
      onUserDeleted(targetId);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(', ')
          : 'Failed to delete user.');
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="delete-user-modal-overlay"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-150">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Delete User Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete this account?
            </p>
          </div>
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

        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">{user.name}</span>
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
          <span className="text-xs text-slate-500 block mt-0.5">{user.email}</span>
        </div>

        <p className="text-xs text-slate-600 mb-5">
          This will revoke all access permissions and delete associated authentication records. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            id="cancel-delete-user-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            id="confirm-delete-user-btn"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
