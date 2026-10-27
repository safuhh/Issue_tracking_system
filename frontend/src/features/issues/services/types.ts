export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'pending' | 'in-progress' | 'closed';

export interface IssueUserSummary {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
}

export interface IssueComment {
  _id?: string;
  id?: string;
  content: string;
  author: IssueUserSummary;
  createdAt: string;
}

export interface Issue {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  submittedBy: IssueUserSummary;
  assignedTo?: IssueUserSummary | null;
  comments?: IssueComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  priority?: IssuePriority;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  assignedTo?: string | null;
}

export interface IssueStats {
  total: number;
  pending: number;
  inProgress: number;
  closed: number;
}

export interface CreateIssueResponse {
  success: boolean;
  message: string;
  issue: Issue;
}

export interface IssuesListResponse {
  success: boolean;
  issues: Issue[];
}

export interface IssueStatsResponse {
  success: boolean;
  stats: IssueStats;
}

export interface DevelopersListResponse {
  success: boolean;
  developers: IssueUserSummary[];
}

export interface IssueCommentsResponse {
  success: boolean;
  comments: IssueComment[];
  message?: string;
}
