import React from 'react';

interface AdminHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ isLoading, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          System telemetry, user directory, and platform governance.
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
      >
        <span className={isLoading ? 'animate-spin' : ''}>↻</span>
        <span>Refresh Metrics</span>
      </button>
    </div>
  );
};

export default AdminHeader;
