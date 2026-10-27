import React from 'react';
import { IssueStatus } from '../../issues/services/types';

export interface DeveloperIssueFilterHeaderProps {
  filteredCount: number;
  filter: 'all' | IssueStatus;
  onFilterChange: (filter: 'all' | IssueStatus) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const DeveloperIssueFilterHeader: React.FC<DeveloperIssueFilterHeaderProps> = ({
  filteredCount,
  filter,
  onFilterChange,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <span>My Assigned Issues</span>
          <span className="text-xs font-normal text-slate-500">
            ({filteredCount} {filteredCount === 1 ? 'ticket' : 'tickets'})
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tickets assigned to you. Post progress comments and update statuses to synchronize with Admin Dashboard.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('pending')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('in-progress')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'in-progress'
                ? 'bg-white text-blue-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('closed')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'closed'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Closed
          </button>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <svg
            className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default DeveloperIssueFilterHeader;
