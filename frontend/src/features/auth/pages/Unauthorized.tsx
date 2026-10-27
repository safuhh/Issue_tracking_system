import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useRBAC } from '../hooks/useRBAC';

export const Unauthorized: React.FC = () => {
  const { role } = useRBAC();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-rose-600 mb-2">
          403 Forbidden
        </span>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Access Restricted
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Your current authenticated role is{' '}
          <span className="font-semibold text-slate-900 uppercase">
            {role || 'Guest'}
          </span>
          . You do not have the required permissions to access this page.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/profile"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Profile
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Unauthorized;
