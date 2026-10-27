import React from 'react';
import { AdminUser } from '../../auth/services/authService';

interface UserListTableProps {
  users?: AdminUser[];
  totalCount?: number;
  isLoading: boolean;
  currentAdminId?: string;
  onEditUser?: (user: AdminUser) => void;
  onDeleteUser?: (user: AdminUser) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  users,
  totalCount,
  isLoading,
  currentAdminId: _currentAdminId,
  onEditUser,
  onDeleteUser,
}) => {
  return (
    <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-800">
          Users ({totalCount ?? users?.length ?? 0})
        </h2>
        <span className="text-xs text-slate-500">RBAC Verified</span>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs">
                Loading users...
              </td>
            </tr>
          ) : users?.length ? (
            users.map((u, i) => {
              const isEditable = u.role !== 'admin';

              return (
                <tr key={u._id || u.id || i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : u.role === 'developer'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditable ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditUser?.(u)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                          id={`edit-user-btn-${u._id || u.id || i}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser?.(u)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-white border border-slate-300 rounded hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                          id={`delete-user-btn-${u._id || u.id || i}`}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {u.role === 'admin' ? 'Protected' : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserListTable;
