import React from 'react';
import { Issue, IssueStatus, IssueUserSummary } from '../../issues/services/types';
import { IssuePriorityBadge, IssueStatusBadge } from '../../issues/components/IssueBadges';

export interface AdminIssueTableRowProps {
  issue: Issue;
  developers: IssueUserSummary[];
  isUpdating: boolean;
  isAssigning: boolean;
  onStatusChange: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  onAssignChange: (issueId: string, developerId: string) => Promise<void>;
  onEditIssue: (issue: Issue) => void;
  onDeleteIssue: (issue: Issue) => void;
  onViewComments: (issue: Issue) => void;
}

export const AdminIssueTableRow: React.FC<AdminIssueTableRowProps> = ({
  issue,
  developers,
  isUpdating,
  isAssigning,
  onStatusChange,
  onAssignChange,
  onEditIssue,
  onDeleteIssue,
  onViewComments,
}) => {
  const currentAssignedId = issue.assignedTo?._id || issue.assignedTo?.id || '';
  const commentCount = issue.comments?.length || 0;
  const issueId = issue._id || issue.id!;

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      {/* Title & Description */}
      <td className="px-4 py-3.5 max-w-xs">
        <div className="font-semibold text-slate-900 text-sm">{issue.title}</div>
        <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
          {issue.description}
        </p>
        <span className="text-[10px] text-slate-400 mt-1 block">
          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Recently'}
        </span>
      </td>

      {/* Priority */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <IssuePriorityBadge priority={issue.priority} />
      </td>

      {/* Submitter */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="font-medium text-slate-900">
          {issue.submittedBy?.name || 'Unknown User'}
        </div>
        <div className="text-[11px] text-slate-500">
          {issue.submittedBy?.email || 'N/A'}
        </div>
      </td>

      {/* Assigned Developer Dropdown */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {isAssigning ? (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Assigning...
          </span>
        ) : (
          <div className="flex flex-col gap-1">
            <select
              value={currentAssignedId}
              onChange={(e) => onAssignChange(issueId, e.target.value)}
              className={`px-2 py-1 text-xs rounded-md border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                currentAssignedId
                  ? 'border-indigo-200 text-indigo-900 bg-indigo-50/30 font-medium'
                  : 'border-slate-300 text-slate-600'
              }`}
              aria-label={`Assign developer to issue ${issue.title}`}
            >
              <option value="">— Unassigned —</option>
              {developers.map((dev) => {
                const devId = dev._id || dev.id || '';
                return (
                  <option key={devId} value={devId}>
                    {dev.name} ({dev.email})
                  </option>
                );
              })}
            </select>
            {issue.assignedTo && (
              <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                Assigned to {issue.assignedTo.name}
              </span>
            )}
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <IssueStatusBadge status={issue.status} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right">
        <div className="inline-flex items-center gap-1.5 justify-end">
          {isUpdating ? (
            <span className="text-xs text-slate-400">Updating...</span>
          ) : (
            <select
              value={issue.status}
              onChange={(e) => onStatusChange(issueId, e.target.value as IssueStatus)}
              className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              aria-label={`Change status for issue ${issue.title}`}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In-Progress</option>
              <option value="closed">Closed</option>
            </select>
          )}

          {/* Comments button */}
          <button
            type="button"
            onClick={() => onViewComments(issue)}
            className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
            title="Discussion & Comments"
            id={`comments-issue-btn-${issueId}`}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Comments</span>
            {commentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {commentCount}
              </span>
            )}
          </button>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => onEditIssue(issue)}
            className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
            title="Edit Issue"
            id={`edit-issue-btn-${issueId}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Edit</span>
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDeleteIssue(issue)}
            className="px-2 py-1 text-xs font-medium rounded-md border border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100/70 transition-colors flex items-center gap-1 cursor-pointer"
            title="Delete Issue"
            id={`delete-issue-btn-${issueId}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminIssueTableRow;
