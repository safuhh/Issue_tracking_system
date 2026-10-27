import React from 'react';
import { IssueStatus } from '../../issues/services/types';

export interface AdminIssueTableFiltersProps {
  totalCount: number;
  filteredCount: number;
  statusFilter: 'all' | IssueStatus;
  onStatusFilterChange: (filter: 'all' | IssueStatus) => void;
  pendingCount: number;
  inProgressCount: number;
  closedCount: number;
}

export const AdminIssueTableFilters: React.FC<AdminIssueTableFiltersProps> = ({
  totalCount,
  filteredCount,
  statusFilter,
  onStatusFilterChange,
  pendingCount,
  inProgressCount,
  closedCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <span>Submitted Issues</span>
          <span className="text-xs font-normal text-slate-500">
            ({filteredCount} {filteredCount === 1 ? 'ticket' : 'tickets'})
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Assign issues to developers, triage priorities, review developer comments, and manage tickets.
        </p>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
        <button
          type="button"
          onClick={() => onStatusFilterChange('all')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('pending')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-white text-amber-800 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('in-progress')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'in-progress'
              ? 'bg-white text-blue-800 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          In-Progress ({inProgressCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('closed')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'closed'
              ? 'bg-white text-emerald-800 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Closed ({closedCount})
        </button>
      </div>
    </div>
  );
};

export default AdminIssueTableFilters;
