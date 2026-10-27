import React from 'react';

export interface AdminDashboardTabsProps {
  activeTab: 'issues' | 'users';
  onTabChange: (tab: 'issues' | 'users') => void;
  issuesCount: number;
  usersCount: number;
}

export const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  activeTab,
  onTabChange,
  issuesCount,
  usersCount,
}) => {
  return (
    <div className="mt-8 border-b border-slate-200">
      <nav className="flex space-x-6" aria-label="Dashboard sections">
        <button
          type="button"
          onClick={() => onTabChange('issues')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'issues'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span>Submitted Issues</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'issues'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {issuesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('users')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span>User Management</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'users'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {usersCount}
          </span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboardTabs;
