import React, { useState, useEffect } from 'react';
import { issueCommentsService } from '../services/issue.comments.service';
import { Issue, IssueComment } from '../services/types';

interface IssueCommentsModalProps {
  issue: Issue | null;
  currentUser: { id?: string; name?: string; role?: string } | null;
  onClose: () => void;
  onCommentAdded?: (updatedComments: IssueComment[]) => void;
}

export const IssueCommentsModal: React.FC<IssueCommentsModalProps> = ({
  issue,
  currentUser,
  onClose,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issueId = issue?._id || issue?.id;

  const fetchComments = async () => {
    if (!issueId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await issueCommentsService.getComments(issueId);
      if (res.success && res.comments) {
        setComments(res.comments);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load comments for this issue.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (issue) {
      if (issue.comments && issue.comments.length > 0) {
        setComments(issue.comments);
      }
      fetchComments();
    }
  }, [issue]);

  if (!issue) return null;

  // Determine if current user is allowed to comment:
  // Developers assigned to this issue OR Administrators
  const isAssignedDev =
    currentUser?.role === 'developer' &&
    (issue.assignedTo?._id === currentUser?.id || issue.assignedTo?.id === currentUser?.id);
  const isAdmin = currentUser?.role === 'admin';
  const canAddComment = isAssignedDev || isAdmin;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await issueCommentsService.addComment(issueId!, newComment.trim());
      if (res.success && res.comments) {
        setComments(res.comments);
        setNewComment('');
        if (onCommentAdded) {
          onCommentAdded(res.comments);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to submit comment. Please check your permissions.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'developer':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="issue-comments-modal-overlay"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Issue Discussion & Comments</h2>
              <p className="text-xs text-slate-500 truncate max-w-sm">
                Ticket: <strong className="text-slate-700">{issue.title}</strong>
              </p>
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
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 min-h-[160px]">
          {isLoading && comments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <div className="w-9 h-9 rounded-full bg-slate-100 mx-auto mb-2 flex items-center justify-center text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-700">No comments yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {canAddComment
                  ? 'Be the first to post a developer progress update on this ticket.'
                  : 'The assigned developer or admin will post progress updates here.'}
              </p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const authorName = comment.author?.name || 'User';
              const authorRole = comment.author?.role || 'user';
              const isCurrentUserAuthor =
                comment.author?._id === currentUser?.id || comment.author?.id === currentUser?.id;

              return (
                <div
                  key={comment._id || comment.id || index}
                  className={`p-3.5 rounded-xl border text-xs transition-colors ${
                    isCurrentUserAuthor
                      ? 'bg-indigo-50/40 border-indigo-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{authorName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase border ${getRoleBadge(
                          authorRole
                        )}`}
                      >
                        {authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Recently'}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form or Notice */}
        <div className="pt-3 border-t border-slate-200">
          {canAddComment ? (
            <form onSubmit={handleAddComment} className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Add developer update / resolution comment</span>
                <span>{newComment.length}/1500 chars</span>
              </div>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write progress notes, reproduction findings, or resolution details..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  id="submit-comment-btn"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post Comment</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-500">
              <span>Only the assigned developer and administrators can post comments on this ticket.</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCommentsModal;
