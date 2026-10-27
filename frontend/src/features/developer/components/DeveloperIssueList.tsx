import React, { useState } from 'react';
import { Issue, IssueStatus } from '../../issues/services/types';
import { DeveloperIssueStatsBanner } from './DeveloperIssueStatsBanner';
import { DeveloperIssueFilterHeader } from './DeveloperIssueFilterHeader';
import { DeveloperIssueTableRow } from './DeveloperIssueTableRow';

export interface DeveloperIssueListProps {
  issues: Issue[];
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (issueId: string, status: IssueStatus) => Promise<void>;
  onViewComments: (issue: Issue) => void;
}

export const DeveloperIssueList: React.FC<DeveloperIssueListProps> = ({
  issues,
  isLoading,
  onRefresh,
  onUpdateStatus,
  onViewComments,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | IssueStatus>('all');

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    try {
      setUpdatingId(issueId);
      await onUpdateStatus(issueId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'pending').length;
  const inProgressCount = issues.filter((i) => i.status === 'in-progress').length;
  const closedCount = issues.filter((i) => i.status === 'closed').length;

  return (
    <div className="mt-6">
      {/* Mini Stats Banner */}
      <DeveloperIssueStatsBanner
        totalCount={totalCount}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        closedCount={closedCount}
      />

      {/* Header & Filter Controls */}
      <DeveloperIssueFilterHeader
        filteredCount={filteredIssues.length}
        filter={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      {/* Table of Assigned Issues */}
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
                  Reported By
                </th>
                <th scope="col" className="px-4 py-3">
                  Current Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading assigned issues...
                    </div>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">No assigned issues</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {filter === 'all'
                          ? 'You do not have any issues assigned to you yet. Admins can assign issues to you from the Admin Dashboard.'
                          : `No issues found with "${filter}" status.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const issueId = issue._id || issue.id || Math.random().toString();
                  return (
                    <DeveloperIssueTableRow
                      key={issueId}
                      issue={issue}
                      isUpdating={updatingId === issueId}
                      onStatusChange={handleStatusChange}
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

export default DeveloperIssueList;
