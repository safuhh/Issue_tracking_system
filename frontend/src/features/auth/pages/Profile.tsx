import React from 'react';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../hooks/useAuth';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your authenticated account details and session status.
          </p>
        </div>

        <div className="mt-6 border border-slate-200 rounded-lg divide-y divide-slate-100">
          <div className="px-4 py-3.5 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Name</span>
            <span className="text-sm font-medium text-slate-900">{user?.name}</span>
          </div>

          <div className="px-4 py-3.5 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Email</span>
            <span className="text-sm text-slate-700">{user?.email}</span>
          </div>

          <div className="px-4 py-3.5 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Role</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                user?.role === 'admin'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : user?.role === 'developer'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center">
          <button
            onClick={logout}
            className="px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
