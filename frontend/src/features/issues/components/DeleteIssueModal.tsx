import React, { useState } from 'react';
import { issueManagementService } from '../services/issue.management.service';
import { Issue } from '../services/types';

interface DeleteIssueModalProps {
  issue: Issue | null;
  onClose: () => void;
  onIssueDeleted: (issueId: string) => void;
}

export const DeleteIssueModal: React.FC<DeleteIssueModalProps> = ({
  issue,
  onClose,
  onIssueDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!issue) return null;

  const handleDelete = async () => {
    const targetId = issue._id || issue.id;
    if (!targetId) {
      setError('Issue ID is missing.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await issueManagementService.deleteIssue(targetId);
      onIssueDeleted(targetId);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors)
            ? err.response.data.errors.join(', ')
            : 'Failed to delete issue.')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="delete-issue-modal-overlay"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-150">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Delete Issue</h2>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this issue? This action will permanently remove it from the system and cannot be reversed.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs mb-4">
          <div className="font-semibold text-slate-900">{issue.title}</div>
          <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
            {issue.description}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            id="confirm-delete-issue-btn"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Issue</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteIssueModal;
