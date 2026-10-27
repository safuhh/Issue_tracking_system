import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../auth/hooks/useAuth';
import { CreateIssueForm } from '../components/CreateIssueForm';
import { UserIssueList } from '../components/UserIssueList';
import { EditIssueModal } from '../components/EditIssueModal';
import { DeleteIssueModal } from '../components/DeleteIssueModal';
import { IssueCommentsModal } from '../components/IssueCommentsModal';
import { issueManagementService } from '../services/issue.management.service';
import { Issue } from '../services/types';

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);
  const [commentsIssue, setCommentsIssue] = useState<Issue | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUserIssues = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await issueManagementService.getMyIssues();
      if (response.success && response.issues) {
        setIssues(response.issues);
      }
    } catch (err) {
      console.error('Failed to load user issues:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserIssues();
    }
  }, [isAuthenticated, fetchUserIssues]);

  const handleIssueCreated = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleIssueUpdated = (updated: Issue) => {
    setIssues((prev) =>
      prev.map((i) => ((i._id || i.id) === (updated._id || updated.id) ? updated : i))
    );
    setActionSuccess(`Issue "${updated.title}" updated successfully.`);
  };

  const handleIssueDeleted = (deletedId: string) => {
    setIssues((prev) => prev.filter((i) => (i._id || i.id) !== deletedId));
    setActionSuccess('Issue deleted successfully.');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Alerts */}
        {actionSuccess && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Banner for Guests */}
        {!isAuthenticated ? (
          <div className="py-12 text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Issue Tracking & Developer Coordination System
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Report, track, and resolve system issues with real-time clarity.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
              IssueTrackr enables users to submit tickets, developers to triage and resolve assigned tasks, and administrators to orchestrate user permissions and platform statistics.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-900 uppercase">User Ticketing</span>
                <p className="text-xs text-slate-500 mt-1">Submit tickets with priority, track statuses, and view developer progress notes.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs font-bold text-indigo-700 uppercase">Developer Portal</span>
                <p className="text-xs text-slate-500 mt-1">Manage assigned tickets, post progress updates, and sync statuses in real-time.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs font-bold text-emerald-700 uppercase">Admin Governance</span>
                <p className="text-xs text-slate-500 mt-1">Full triage table, developer assignments, user management, and system analytics.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back, {user?.name}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit new tickets or track your previous issue submissions below.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-slate-50 text-slate-700 border-slate-200 capitalize">
                  Role: {user?.role}
                </span>
                {user?.role === 'developer' && (
                  <Link
                    to="/dev"
                    className="text-xs px-3 py-1 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Go to Dev Portal →
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-xs px-3 py-1 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    Go to Admin Dashboard →
                  </Link>
                )}
              </div>
            </div>

            {/* Create Issue Section */}
            <CreateIssueForm onIssueCreated={handleIssueCreated} />

            {/* User Submitted Issues Table */}
            <UserIssueList
              issues={issues}
              isLoading={isLoading}
              onRefresh={fetchUserIssues}
              onEditIssue={setEditingIssue}
              onDeleteIssue={setDeletingIssue}
              onViewComments={setCommentsIssue}
            />

            {/* Modals */}
            {commentsIssue && (
              <IssueCommentsModal
                issue={commentsIssue}
                currentUser={user}
                onClose={() => setCommentsIssue(null)}
              />
            )}

            {editingIssue && (
              <EditIssueModal
                issue={editingIssue}
                isAdmin={false}
                onClose={() => setEditingIssue(null)}
                onIssueUpdated={handleIssueUpdated}
              />
            )}

            {deletingIssue && (
              <DeleteIssueModal
                issue={deletingIssue}
                onClose={() => setDeletingIssue(null)}
                onIssueDeleted={handleIssueDeleted}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
