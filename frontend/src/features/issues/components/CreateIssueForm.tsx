import React, { useState } from 'react';
import { issueManagementService } from '../services/issue.management.service';
import { Issue, IssuePriority } from '../services/types';

interface CreateIssueFormProps {
  onIssueCreated: (issue: Issue) => void;
}

export const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ onIssueCreated }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long';
    } else if (title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length < 5) {
      errs.description = 'Description must be at least 5 characters long';
    } else if (description.trim().length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await issueManagementService.createIssue({
        title: title.trim(),
        priority,
        description: description.trim(),
      });

      if (response.success && response.issue) {
        setSuccessMessage('Issue submitted successfully! Our team will review it shortly.');
        setTitle('');
        setPriority('medium');
        setDescription('');
        setErrors({});
        onIssueCreated(response.issue);
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to submit issue. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Create & Submit Issue</h2>
          <p className="text-xs text-slate-500">Report a bug, system issue, or feature request.</p>
        </div>
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

      {serverError && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{serverError}</span>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-semibold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Title & Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="issue-title" className="block text-xs font-medium text-slate-700 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session timeout occurs prematurely on user dashboard"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                errors.title
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="issue-priority" className="block text-xs font-medium text-slate-700 mb-1">
              Priority
            </label>
            <select
              id="issue-priority"
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
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="issue-description" className="block text-xs font-medium text-slate-700">
              Description & Steps to Reproduce <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">{description.length}/2000 chars</span>
          </div>
          <textarea
            id="issue-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail the issue, environment, steps to reproduce, and expected versus observed behavior..."
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
              errors.description
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="submit-issue-btn"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting Issue...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Submit Issue</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssueForm;
