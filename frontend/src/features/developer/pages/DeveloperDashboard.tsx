import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../auth/hooks/useAuth';
import { issueManagementService } from '../../issues/services/issue.management.service';
import { Issue, IssueStatus } from '../../issues/services/types';
import { DeveloperIssueList } from '../components/DeveloperIssueList';
import { IssueCommentsModal } from '../../issues/components/IssueCommentsModal';

export const DeveloperDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignedIssues, setAssignedIssues] = useState<Issue[]>([]);
  const [commentsIssue, setCommentsIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAssignedIssues = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const issuesRes = await issueManagementService.getAssignedIssues();

      if (issuesRes.success && issuesRes.issues) {
        setAssignedIssues(issuesRes.issues);
      }
    } catch (err: any) {
      if (!isSilent) {
        setError(
          err.response?.data?.message ||
            'Failed to load developer issues. Ensure you have developer or admin permissions.'
        );
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedIssues(false);

    const interval = setInterval(() => {
      fetchAssignedIssues(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchAssignedIssues]);

  const handleUpdateStatus = async (issueId: string, status: IssueStatus) => {
    try {
      setError(null);
      const res = await issueManagementService.updateIssueStatus(issueId, status);
      setSuccessMessage(res.message || `Issue status changed to ${status}`);

      setAssignedIssues((prev) =>
        prev.map((i) => ((i._id || i.id) === issueId ? { ...i, status } : i))
      );

      fetchAssignedIssues(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update issue status');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Developer Dashboard</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                {user?.role} portal
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              View and resolve issues assigned to you. Add progress comments and update statuses to synchronize with Admin Dashboard.
            </p>
          </div>

          <button
            onClick={() => fetchAssignedIssues(false)}
            disabled={isLoading}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            id="dev-refresh-btn"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Assigned Issues Feature */}
        <DeveloperIssueList
          issues={assignedIssues}
          isLoading={isLoading}
          onRefresh={() => fetchAssignedIssues(false)}
          onUpdateStatus={handleUpdateStatus}
          onViewComments={setCommentsIssue}
        />

        {/* Comments Modal for Developer */}
        {commentsIssue && (
          <IssueCommentsModal
            issue={commentsIssue}
            currentUser={user}
            onClose={() => setCommentsIssue(null)}
            onCommentAdded={(updatedComments) => {
              setAssignedIssues((prev) =>
                prev.map((i) =>
                  (i._id || i.id) === (commentsIssue._id || commentsIssue.id)
                    ? { ...i, comments: updatedComments }
                    : i
                )
              );
            }}
          />
        )}
      </main>
    </div>
  );
};

export default DeveloperDashboard;
