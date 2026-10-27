import React, { useState } from 'react';
import { Issue, IssueStatus, IssueUserSummary } from '../../issues/services/types';
import { AdminIssueTableFilters } from './AdminIssueTableFilters';
import { AdminIssueTableRow } from './AdminIssueTableRow';

export interface AdminIssueListTableProps {
  issues?: Issue[];
  developers?: IssueUserSummary[];
  isLoading?: boolean;
  onUpdateStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  onAssignDeveloper: (issueId: string, developerId: string | null) => Promise<void>;
  onEditIssue: (issue: Issue) => void;
  onDeleteIssue: (issue: Issue) => void;
  onViewComments: (issue: Issue) => void;
}

export const AdminIssueListTable: React.FC<AdminIssueListTableProps> = ({
  issues = [],
  developers = [],
  isLoading = false,
  onUpdateStatus,
  onAssignDeveloper,
  onEditIssue,
  onDeleteIssue,
  onViewComments,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | IssueStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const filteredIssues = issues.filter((issue) => {
    if (statusFilter === 'all') return true;
    return issue.status === statusFilter;
  });

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      setUpdatingId(issueId);
      await onUpdateStatus(issueId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignChange = async (issueId: string, developerId: string) => {
    try {
      setAssigningId(issueId);
      await onAssignDeveloper(issueId, developerId ? developerId : null);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="mt-8">
      {/* Section Header & Filters */}
      <AdminIssueTableFilters
        totalCount={issues.length}
        filteredCount={filteredIssues.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        pendingCount={issues.filter((i) => i.status === 'pending').length}
        inProgressCount={issues.filter((i) => i.status === 'in-progress').length}
        closedCount={issues.filter((i) => i.status === 'closed').length}
      />

      {/* Issues Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Issue & Details
                </th>
                <th scope="col" className="px-4 py-3">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3">
                  Submitted By
                </th>
                <th scope="col" className="px-4 py-3">
                  Assigned Developer
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading submitted issues...
                    </div>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-sm font-medium text-slate-700">No issues found</span>
                      <span className="text-xs text-slate-400">
                        {statusFilter === 'all'
                          ? 'No issues have been submitted by users yet.'
                          : `No issues found with "${statusFilter}" status.`}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const issueId = issue._id || issue.id || Math.random().toString();
                  return (
                    <AdminIssueTableRow
                      key={issueId}
                      issue={issue}
                      developers={developers}
                      isUpdating={updatingId === issueId}
                      isAssigning={assigningId === issueId}
                      onStatusChange={handleStatusChange}
                      onAssignChange={handleAssignChange}
                      onEditIssue={onEditIssue}
                      onDeleteIssue={onDeleteIssue}
                      onViewComments={onViewComments}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminIssueListTable;
