import React from 'react';
import { Issue } from '../services/issueService';
import { IssuePriorityBadge, IssueStatusBadge } from './IssueBadges';

interface UserIssueListProps {
  issues: Issue[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditIssue?: (issue: Issue) => void;
  onDeleteIssue?: (issue: Issue) => void;
  onViewComments?: (issue: Issue) => void;
}

export const UserIssueList: React.FC<UserIssueListProps> = ({
  issues,
  isLoading,
  onRefresh,
  onEditIssue,
  onDeleteIssue,
  onViewComments,
}) => {

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <span>My Submitted Issues</span>
            <span className="text-xs font-normal text-slate-500">
              ({issues.length} {issues.length === 1 ? 'ticket' : 'tickets'})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time status, view developer comments, or edit your submissions.
          </p>
        </div>

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

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Issue Title & Description
                </th>
                <th scope="col" className="px-4 py-3">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3">
                  Current Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Submitted On
                </th>
                {(onEditIssue || onDeleteIssue || onViewComments) && (
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                )}
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
                      Loading your issues...
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        No issues submitted yet
                      </span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Use the form above to submit your first issue or report. It will appear here with live status updates.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                issues.map((issue) => {
                  const issueKey = issue._id || issue.id || Math.random().toString();
                  const commentCount = issue.comments?.length || 0;

                  return (
                    <tr key={issueKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 max-w-md">
                        <div className="font-semibold text-slate-900 text-sm">{issue.title}</div>
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                          {issue.description}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <IssuePriorityBadge priority={issue.priority} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <IssueStatusBadge status={issue.status} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Recently'}
                      </td>

                      {(onEditIssue || onDeleteIssue || onViewComments) && (
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Comments button for user to view developer updates */}
                            {onViewComments && (
                              <button
                                type="button"
                                onClick={() => onViewComments(issue)}
                                className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                                title="View Developer Comments"
                                id={`user-comments-btn-${issue._id || issue.id}`}
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
                            )}

                            {onEditIssue && (
                              <button
                                type="button"
                                onClick={() => onEditIssue(issue)}
                                className="px-2 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit Issue"
                                id={`user-edit-issue-btn-${issue._id || issue.id}`}
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
                            )}

                            {onDeleteIssue && (
                              <button
                                type="button"
                                onClick={() => onDeleteIssue(issue)}
                                className="px-2 py-1 text-xs font-medium rounded-md border border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100/70 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete Issue"
                                id={`user-delete-issue-btn-${issue._id || issue.id}`}
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
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
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

export default UserIssueList;
