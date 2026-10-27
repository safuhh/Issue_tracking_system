import api from '../../../shared/services/api';
import {
  CreateIssuePayload,
  UpdateIssuePayload,
  CreateIssueResponse,
  IssuesListResponse,
  IssueStatus,
} from './types';

export const issueManagementService = {
  /**
   * Submit a new issue (Normal user)
   */
  createIssue: async (payload: CreateIssuePayload): Promise<CreateIssueResponse> => {
    const response = await api.post<CreateIssueResponse>('/issues', payload);
    return response.data;
  },

  /**
   * Get issues submitted by current user
   */
  getMyIssues: async (): Promise<IssuesListResponse> => {
    const response = await api.get<IssuesListResponse>('/issues/my');
    return response.data;
  },

  /**
   * Get all submitted issues (Admin only)
   */
  getAllIssues: async (params?: { status?: string; priority?: string }): Promise<IssuesListResponse> => {
    const response = await api.get<IssuesListResponse>('/issues', { params });
    return response.data;
  },

  /**
   * Update issue details (Admin or Issue Creator)
   */
  updateIssue: async (
    id: string,
    payload: UpdateIssuePayload
  ): Promise<CreateIssueResponse> => {
    const response = await api.put<CreateIssueResponse>(`/issues/${id}`, payload);
    return response.data;
  },

  /**
   * Delete issue (Admin or Issue Creator)
   */
  deleteIssue: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/issues/${id}`);
    return response.data;
  },

  /**
   * Get issues assigned to the logged-in developer
   */
  getAssignedIssues: async (): Promise<IssuesListResponse> => {
    const response = await api.get<IssuesListResponse>('/issues/assigned');
    return response.data;
  },

  /**
   * Update issue status (Admin and Assigned Developer)
   */
  updateIssueStatus: async (
    id: string,
    status: IssueStatus
  ): Promise<CreateIssueResponse> => {
    const response = await api.patch<CreateIssueResponse>(`/issues/${id}/status`, {
      status,
    });
    return response.data;
  },
};

export default issueManagementService;
