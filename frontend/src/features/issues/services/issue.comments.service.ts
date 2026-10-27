import api from '../../../shared/services/api';
import { IssueCommentsResponse } from './types';

export const issueCommentsService = {
  /**
   * Add comment to issue (Developer assigned to issue, or Admin)
   */
  addComment: async (id: string, content: string): Promise<IssueCommentsResponse> => {
    const response = await api.post<IssueCommentsResponse>(`/issues/${id}/comments`, {
      content,
    });
    return response.data;
  },

  /**
   * Get comments for an issue (Admin, assigned developer, or submitter)
   */
  getComments: async (id: string): Promise<IssueCommentsResponse> => {
    const response = await api.get<IssueCommentsResponse>(`/issues/${id}/comments`);
    return response.data;
  },
};

export default issueCommentsService;
