import api from '../../../shared/services/api';
import { CreateIssueResponse, DevelopersListResponse } from './types';

export const issueAssignmentService = {
  /**
   * Assign issue to developer (Admin only)
   */
  assignIssue: async (
    id: string,
    developerId: string | null
  ): Promise<CreateIssueResponse> => {
    const response = await api.patch<CreateIssueResponse>(`/issues/${id}/assign`, {
      developerId,
    });
    return response.data;
  },

  /**
   * Get list of developers for assignment dropdown (Admin only)
   */
  getDevelopers: async (): Promise<DevelopersListResponse> => {
    const response = await api.get<DevelopersListResponse>('/issues/developers');
    return response.data;
  },
};

export default issueAssignmentService;
