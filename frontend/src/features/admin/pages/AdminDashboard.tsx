import React, { useState } from 'react';
import Navbar from '../../../shared/components/Navbar';
import { AdminHeader } from '../components/AdminHeader';
import { IssueStatsCards } from '../components/IssueStatsCards';
import { AdminIssueListTable } from '../components/AdminIssueListTable';
import { CreateUserForm } from '../components/CreateUserForm';
import { UserListTable } from '../components/UserListTable';
import { AdminDashboardTabs } from '../components/AdminDashboardTabs';
import { AdminDashboardModals } from '../components/AdminDashboardModals';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import { AdminUser } from '../../auth/services/authService';
import { Issue } from '../../issues/services/types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    adminData,
    developers,
    isLoading,
    error,
    actionSuccess,
    setActionSuccess,
    fetchAdminData,
    handleUpdateIssueStatus,
    handleAssignDeveloper,
    handleIssueUpdated,
    handleIssueDeleted,
    handleUserCreated,
    handleUserUpdated,
    handleUserDeleted,
    handleCommentAdded,
  } = useAdminDashboardData();

  const [activeTab, setActiveTab] = useState<'issues' | 'users'>('issues');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);
  const [commentsIssue, setCommentsIssue] = useState<Issue | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <AdminHeader isLoading={isLoading} onRefresh={() => fetchAdminData(false)} />

        {/* Action success alert */}
        {actionSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
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

        {/* Error alert */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Issue Management Statistics Cards */}
        <IssueStatsCards stats={adminData?.stats?.issueStats} isLoading={isLoading} />

        {/* Navigation Tabs */}
        <AdminDashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          issuesCount={adminData?.stats?.issueStats?.total ?? adminData?.issues?.length ?? 0}
          usersCount={adminData?.stats?.totalUsers ?? adminData?.users?.length ?? 0}
        />

        {/* Tab Content */}
        {activeTab === 'issues' ? (
          <AdminIssueListTable
            issues={adminData?.issues}
            developers={developers}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateIssueStatus}
            onAssignDeveloper={handleAssignDeveloper}
            onEditIssue={setEditingIssue}
            onDeleteIssue={setDeletingIssue}
            onViewComments={setCommentsIssue}
          />
        ) : (
          <div className="space-y-6 mt-6">
            <CreateUserForm onUserCreated={handleUserCreated} />

            <UserListTable
              users={adminData?.users}
              totalCount={adminData?.stats?.totalUsers}
              isLoading={isLoading}
              currentAdminId={user?.id}
              onEditUser={setEditingUser}
              onDeleteUser={setDeletingUser}
            />
          </div>
        )}

        {/* Modals Manager */}
        <AdminDashboardModals
          commentsIssue={commentsIssue}
          onCloseComments={() => setCommentsIssue(null)}
          onCommentAdded={(updatedComments) => {
            if (commentsIssue) {
              handleCommentAdded(commentsIssue._id || commentsIssue.id!, updatedComments);
            }
          }}
          editingIssue={editingIssue}
          onCloseEditIssue={() => setEditingIssue(null)}
          onIssueUpdated={handleIssueUpdated}
          deletingIssue={deletingIssue}
          onCloseDeleteIssue={() => setDeletingIssue(null)}
          onIssueDeleted={handleIssueDeleted}
          editingUser={editingUser}
          onCloseEditUser={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
          deletingUser={deletingUser}
          onCloseDeleteUser={() => setDeletingUser(null)}
          onUserDeleted={handleUserDeleted}
          developers={developers}
          currentUser={user}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
