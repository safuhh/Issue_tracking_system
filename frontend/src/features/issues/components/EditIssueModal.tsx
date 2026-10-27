import React, { useState, useEffect } from 'react';
import { issueManagementService } from '../services/issue.management.service';
import {
  Issue,
  IssuePriority,
  IssueStatus,
  IssueUserSummary,
} from '../services/types';

interface EditIssueModalProps {
  issue: Issue | null;
  isAdmin?: boolean;
  developers?: IssueUserSummary[];
  onClose: () => void;
  onIssueUpdated: (updatedIssue: Issue) => void;
}

export const EditIssueModal: React.FC<EditIssueModalProps> = ({
  issue,
  isAdmin = false,
  developers = [],
  onClose,
  onIssueUpdated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [status, setStatus] = useState<IssueStatus>('pending');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || '');
      setDescription(issue.description || '');
      setPriority(issue.priority || 'medium');
      setStatus(issue.status || 'pending');
      setAssignedTo(issue.assignedTo?._id || issue.assignedTo?.id || '');
      setError(null);
    }
  }, [issue]);

  if (!issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setError('Title cannot be empty');
      return;
    }
    if (trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (!trimmedDesc) {
      setError('Description cannot be empty');
      return;
    }
    if (trimmedDesc.length < 5) {
      setError('Description must be at least 5 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const issueId = issue._id || issue.id!;
      const payload: {
        title: string;
        description: string;
        priority: IssuePriority;
        status?: IssueStatus;
        assignedTo?: string | null;
      } = {
        title: trimmedTitle,
        description: trimmedDesc,
        priority,
      };

      if (isAdmin) {
        payload.status = status;
        payload.assignedTo = assignedTo ? assignedTo : null;
      }

      const res = await issueManagementService.updateIssue(issueId, payload);
      if (res.success && res.issue) {
        onIssueUpdated(res.issue);
        onClose();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors)
            ? err.response.data.errors.join(', ')
            : 'Failed to update issue.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="edit-issue-modal-overlay"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Edit Issue</h2>
              <p className="text-xs text-slate-500">Update issue details and assignment.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-issue-title" className="block text-xs font-medium text-slate-700 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-issue-priority" className="block text-xs font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                id="edit-issue-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {isAdmin && (
              <div>
                <label htmlFor="edit-issue-status" className="block text-xs font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  id="edit-issue-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          {isAdmin && developers.length > 0 && (
            <div>
              <label htmlFor="edit-issue-assignee" className="block text-xs font-medium text-slate-700 mb-1">
                Assigned Developer
              </label>
              <select
                id="edit-issue-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="">— Unassigned —</option>
                {developers.map((dev) => (
                  <option key={dev._id || dev.id} value={dev._id || dev.id}>
                    {dev.name} ({dev.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="edit-issue-description" className="block text-xs font-medium text-slate-700">
                Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{description.length}/2000 chars</span>
            </div>
            <textarea
              id="edit-issue-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIssueModal;
