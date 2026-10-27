import React from 'react';
import { Issue, IssueStatus } from '../../issues/services/types';
import { IssuePriorityBadge, IssueStatusBadge } from '../../issues/components/IssueBadges';

export interface DeveloperIssueTableRowProps {
  issue: Issue;
  isUpdating: boolean;
  onStatusChange: (issueId: string, status: IssueStatus) => Promise<void>;
  onViewComments: (issue: Issue) => void;
}

export const DeveloperIssueTableRow: React.FC<DeveloperIssueTableRowProps> = ({
  issue,
  isUpdating,
  onStatusChange,
  onViewComments,
}) => {
  const commentCount = issue.comments?.length || 0;
  const issueId = issue._id || issue.id!;

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      {/* Title & Description */}
      <td className="px-4 py-3.5 max-w-sm">
        <div className="font-semibold text-slate-900 text-sm">{issue.title}</div>
        <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
          {issue.description}
        </p>
        <span className="text-[10px] text-slate-400 mt-1 block">
          Reported on {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Recently'}
        </span>
      </td>

      {/* Priority */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <IssuePriorityBadge priority={issue.priority} />
      </td>

      {/* Reported By */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="font-medium text-slate-900">
          {issue.submittedBy?.name || 'User'}
        </div>
        <div className="text-[11px] text-slate-500">
          {issue.submittedBy?.email || 'N/A'}
        </div>
      </td>

      {/* Current Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <IssueStatusBadge status={issue.status} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right">
        <div className="inline-flex items-center gap-1.5 justify-end">
          {/* Comments button */}
          <button
            type="button"
            onClick={() => onViewComments(issue)}
            className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
            title="Comment & Developer Updates"
            id={`dev-comments-btn-${issueId}`}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Comment</span>
            {commentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {commentCount}
              </span>
            )}
          </button>

          {/* Status Select */}
          {isUpdating ? (
            <span className="text-xs text-slate-400">Updating...</span>
          ) : (
            <select
              value={issue.status}
              onChange={(e) => onStatusChange(issueId, e.target.value as IssueStatus)}
              className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              aria-label={`Update status for issue ${issue.title}`}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In-Progress</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DeveloperIssueTableRow;
