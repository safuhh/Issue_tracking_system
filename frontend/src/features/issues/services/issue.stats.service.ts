import api from '../../../shared/services/api';
import { IssueStatsResponse } from './types';

export const issueStatsService = {
  /**
   * Get issue statistics (Admin only)
   */
  getIssueStats: async (): Promise<IssueStatsResponse> => {
    const response = await api.get<IssueStatsResponse>('/issues/stats');
    return response.data;
  },
};

export default issueStatsService;
