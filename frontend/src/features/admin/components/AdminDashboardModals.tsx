import React from 'react';
import { Issue, IssueUserSummary, IssueComment } from '../../issues/services/types';
import { AdminUser } from '../../auth/services/authService';
import { IssueCommentsModal } from '../../issues/components/IssueCommentsModal';
import { EditIssueModal } from '../../issues/components/EditIssueModal';
import { DeleteIssueModal } from '../../issues/components/DeleteIssueModal';
import { EditUserModal } from './EditUserModal';
import { DeleteUserModal } from './DeleteUserModal';

export interface AdminDashboardModalsProps {
  commentsIssue: Issue | null;
  onCloseComments: () => void;
  onCommentAdded: (updatedComments: IssueComment[]) => void;
  editingIssue: Issue | null;
  onCloseEditIssue: () => void;
  onIssueUpdated: (updated: Issue) => void;
  deletingIssue: Issue | null;
  onCloseDeleteIssue: () => void;
  onIssueDeleted: (deletedId: string) => void;
  editingUser: AdminUser | null;
  onCloseEditUser: () => void;
  onUserUpdated: (updatedUser: AdminUser) => void;
  deletingUser: AdminUser | null;
  onCloseDeleteUser: () => void;
  onUserDeleted: (deletedUserId: string) => void;
  developers: IssueUserSummary[];
  currentUser: { id?: string; name?: string; email?: string; role?: string } | null;
}

export const AdminDashboardModals: React.FC<AdminDashboardModalsProps> = ({
  commentsIssue,
  onCloseComments,
  onCommentAdded,
  editingIssue,
  onCloseEditIssue,
  onIssueUpdated,
  deletingIssue,
  onCloseDeleteIssue,
  onIssueDeleted,
  editingUser,
  onCloseEditUser,
  onUserUpdated,
  deletingUser,
  onCloseDeleteUser,
  onUserDeleted,
  developers,
  currentUser,
}) => {
  return (
    <>
      {/* Issue Comments Modal */}
      {commentsIssue && (
        <IssueCommentsModal
          issue={commentsIssue}
          currentUser={currentUser}
          onClose={onCloseComments}
          onCommentAdded={onCommentAdded}
        />
      )}

      {/* Edit Issue Modal */}
      {editingIssue && (
        <EditIssueModal
          issue={editingIssue}
          isAdmin={true}
          developers={developers}
          onClose={onCloseEditIssue}
          onIssueUpdated={onIssueUpdated}
        />
      )}

      {/* Delete Issue Modal */}
      {deletingIssue && (
        <DeleteIssueModal
          issue={deletingIssue}
          onClose={onCloseDeleteIssue}
          onIssueDeleted={onIssueDeleted}
        />
      )}

      {/* Update User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={onCloseEditUser}
          onUserUpdated={onUserUpdated}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={onCloseDeleteUser}
          onUserDeleted={onUserDeleted}
        />
      )}
    </>
  );
};

export default AdminDashboardModals;
