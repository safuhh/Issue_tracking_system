export * from './types';
export * from './issue.management.service';
export * from './issue.assignment.service';
export * from './issue.comments.service';
export * from './issue.stats.service';

import { issueManagementService } from './issue.management.service';
import { issueAssignmentService } from './issue.assignment.service';
import { issueCommentsService } from './issue.comments.service';
import { issueStatsService } from './issue.stats.service';

/**
 * Unified issue service facade combining management, assignment, comments, and stats.
 */
export const issueService = {
  ...issueManagementService,
  ...issueAssignmentService,
  ...issueCommentsService,
  ...issueStatsService,
};

export default issueService;
