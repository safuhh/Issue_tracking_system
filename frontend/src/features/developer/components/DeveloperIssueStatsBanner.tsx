import React from 'react';

export interface DeveloperIssueStatsBannerProps {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  closedCount: number;
}

export const DeveloperIssueStatsBanner: React.FC<DeveloperIssueStatsBannerProps> = ({
  totalCount,
  pendingCount,
  inProgressCount,
  closedCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
        <span className="text-[11px] font-medium text-slate-500 uppercase">Assigned Total</span>
        <div className="text-xl font-bold text-slate-900 mt-1">{totalCount}</div>
      </div>
      <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
        <span className="text-[11px] font-medium text-amber-700 uppercase">Pending</span>
        <div className="text-xl font-bold text-amber-900 mt-1">{pendingCount}</div>
      </div>
      <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40">
        <span className="text-[11px] font-medium text-blue-700 uppercase">In Progress</span>
        <div className="text-xl font-bold text-blue-900 mt-1">{inProgressCount}</div>
      </div>
      <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
        <span className="text-[11px] font-medium text-emerald-700 uppercase">Resolved</span>
        <div className="text-xl font-bold text-emerald-900 mt-1">{closedCount}</div>
      </div>
    </div>
  );
};

export default DeveloperIssueStatsBanner;
