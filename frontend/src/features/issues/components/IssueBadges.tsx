import React from 'react';
import { IssuePriority, IssueStatus } from '../services/types';

export const getPriorityBadgeClass = (priority: IssuePriority): string => {
  switch (priority) {
    case 'critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'high':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getStatusBadgeClass = (status: IssueStatus): string => {
  switch (status) {
    case 'closed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'in-progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pending':
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

export const formatStatusLabel = (status: IssueStatus): string => {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    case 'closed':
      return 'Closed';
    case 'pending':
    default:
      return 'Pending';
  }
};

export const IssuePriorityBadge: React.FC<{ priority: IssuePriority }> = ({ priority }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wider ${getPriorityBadgeClass(
      priority
    )}`}
  >
    {priority}
  </span>
);

export const IssueStatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
      status
    )}`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        status === 'closed'
          ? 'bg-emerald-500'
          : status === 'in-progress'
          ? 'bg-blue-500'
          : 'bg-amber-500'
      }`}
    />
    {formatStatusLabel(status)}
  </span>
);

export default IssueStatusBadge;
