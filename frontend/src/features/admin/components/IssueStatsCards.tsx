import React from 'react';
import { IssueStats } from '../../issues/services/types';

interface IssueStatsCardsProps {
  stats?: IssueStats;
  isLoading?: boolean;
}

export const IssueStatsCards: React.FC<IssueStatsCardsProps> = ({ stats, isLoading = false }) => {
  const cards = [
    {
      id: 'stat-total-issues',
      label: 'Total Issues',
      value: stats?.total ?? 0,
      description: 'All submitted tickets',
      borderColor: 'border-slate-200',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      iconColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      id: 'stat-pending-issues',
      label: 'Pending Issues',
      value: stats?.pending ?? 0,
      description: 'Awaiting triage or review',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/40',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'stat-inprogress-issues',
      label: 'In-Progress Issues',
      value: stats?.inProgress ?? 0,
      description: 'Under active work',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50/40',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: 'stat-closed-issues',
      label: 'Closed Issues',
      value: stats?.closed ?? 0,
      description: 'Resolved & verified',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50/40',
      textColor: 'text-emerald-900',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <span>Issue Management Overview</span>
          <span className="text-[11px] font-normal text-slate-500">Live Status Metrics</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            id={card.id}
            className={`p-4 rounded-xl border bg-white shadow-xs transition-all hover:shadow-sm ${card.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-14 bg-slate-200 animate-pulse rounded"></div>
              ) : (
                <span className={`text-2xl font-bold tracking-tight ${card.textColor}`}>
                  {card.value}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-1">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueStatsCards;
