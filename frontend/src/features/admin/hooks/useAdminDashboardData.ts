import { useState, useEffect, useRef, useCallback } from 'react';
import { authService, AdminDataResponse, AdminUser } from '../../auth/services/authService';
import { issueAssignmentService } from '../../issues/services/issue.assignment.service';
import { issueManagementService } from '../../issues/services/issue.management.service';
import {
  Issue,
  IssueStatus,
  IssueStats,
  IssueUserSummary,
  IssueComment,
} from '../../issues/services/types';

// ─── Pure State Update Helpers ────────────────────────────────────────────────

/**
 * Recalculates issue stats when an issue transitions from oldStatus to newStatus
 */
const computeStatusChangeStats = (
  stats: IssueStats | undefined,
  oldStatus: IssueStatus | undefined,
  newStatus: IssueStatus
): IssueStats | undefined => {
  if (!stats || !oldStatus || oldStatus === newStatus) return stats;

  const next = { ...stats };
  if (oldStatus === 'pending') next.pending = Math.max(0, next.pending - 1);
  if (oldStatus === 'in-progress') next.inProgress = Math.max(0, next.inProgress - 1);
  if (oldStatus === 'closed') next.closed = Math.max(0, next.closed - 1);

  if (newStatus === 'pending') next.pending += 1;
  if (newStatus === 'in-progress') next.inProgress += 1;
  if (newStatus === 'closed') next.closed += 1;

  return next;
};

/**
 * Decrements stats counter upon permanent issue deletion
 */
const computeDeletionStats = (
  stats: IssueStats | undefined,
  deletedStatus: IssueStatus | undefined
): IssueStats | undefined => {
  if (!stats) return stats;

  return {
    total: Math.max(0, stats.total - 1),
    pending: deletedStatus === 'pending' ? Math.max(0, stats.pending - 1) : stats.pending,
    inProgress: deletedStatus === 'in-progress' ? Math.max(0, stats.inProgress - 1) : stats.inProgress,
    closed: deletedStatus === 'closed' ? Math.max(0, stats.closed - 1) : stats.closed,
  };
};

/**
 * Synchronizes the developers list when a user's details or role change
 */
const syncDeveloperOnUpdate = (
  developers: IssueUserSummary[],
  updatedUser: AdminUser
): IssueUserSummary[] => {
  const targetId = updatedUser._id || updatedUser.id;

  if (updatedUser.role === 'developer') {
    const exists = developers.some((d) => (d._id || d.id) === targetId);
    return exists
      ? developers.map((d) => ((d._id || d.id) === targetId ? { ...d, ...updatedUser } : d))
      : [...developers, updatedUser];
  }

  return developers.filter((d) => (d._id || d.id) !== targetId);
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export const useAdminDashboardData = () => {
  // State
  const [adminData, setAdminData] = useState<AdminDataResponse | null>(null);
  const [developers, setDevelopers] = useState<IssueUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  // ─── Data Fetching & Sync ───────────────────────────────────────────────────

  const fetchAdminData = useCallback(async (isSilent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const [data, devRes] = await Promise.all([
        authService.getAdminData(),
        issueAssignmentService.getDevelopers().catch(() => ({ developers: [] })),
      ]);

      setAdminData(data);

      if (devRes.developers && devRes.developers.length > 0) {
        setDevelopers(devRes.developers);
      } else if (data.users) {
        setDevelopers(data.users.filter((u) => u.role === 'developer'));
      }
    } catch (err: any) {
      if (!isSilent) {
        setError(err.response?.data?.message || 'Failed to load admin data.');
      }
    } finally {
      isFetchingRef.current = false;
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  // Polling & Window Focus sync
  useEffect(() => {
    fetchAdminData(false);

    const syncInterval = setInterval(() => {
      fetchAdminData(true);
    }, 3500);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchAdminData(true);
      }
    };

    window.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
    };
  }, [fetchAdminData]);

  // ─── Issue Actions ──────────────────────────────────────────────────────────

  const handleUpdateIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const res = await issueManagementService.updateIssueStatus(issueId, newStatus);
      setActionSuccess(res.message || `Issue status updated to ${newStatus}`);

      setAdminData((prev) => {
        if (!prev) return null;
        const target = prev.issues?.find((i) => (i._id || i.id) === issueId);
        return {
          ...prev,
          issues: (prev.issues || []).map((i) =>
            (i._id || i.id) === issueId ? { ...i, status: newStatus } : i
          ),
          stats: {
            ...prev.stats,
            issueStats: computeStatusChangeStats(prev.stats.issueStats, target?.status, newStatus),
          },
        };
      });

      fetchAdminData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update issue status.');
    }
  };

  const handleAssignDeveloper = async (issueId: string, developerId: string | null) => {
    try {
      const res = await issueAssignmentService.assignIssue(issueId, developerId);
      setActionSuccess(res.message || 'Developer assigned successfully.');

      setAdminData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          issues: (prev.issues || []).map((i) =>
            (i._id || i.id) === issueId
              ? { ...i, assignedTo: res.issue?.assignedTo || null }
              : i
          ),
        };
      });

      fetchAdminData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign developer to issue.');
    }
  };

  const handleIssueUpdated = (updated: Issue) => {
    const updatedId = updated._id || updated.id;

    setAdminData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        issues: (prev.issues || []).map((i) =>
          (i._id || i.id) === updatedId ? updated : i
        ),
      };
    });

    setActionSuccess(`Issue "${updated.title}" updated successfully.`);
    fetchAdminData(true);
  };

  const handleIssueDeleted = (deletedId: string) => {
    setAdminData((prev) => {
      if (!prev) return null;
      const target = prev.issues?.find((i) => (i._id || i.id) === deletedId);

      return {
        ...prev,
        issues: (prev.issues || []).filter((i) => (i._id || i.id) !== deletedId),
        stats: {
          ...prev.stats,
          issueStats: computeDeletionStats(prev.stats.issueStats, target?.status),
        },
      };
    });

    setActionSuccess('Issue deleted successfully.');
    fetchAdminData(true);
  };

  const handleCommentAdded = (issueId: string, updatedComments: IssueComment[]) => {
    setAdminData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        issues: (prev.issues || []).map((i) =>
          (i._id || i.id) === issueId ? { ...i, comments: updatedComments } : i
        ),
      };
    });
  };

  // ─── User Actions ───────────────────────────────────────────────────────────

  const handleUserCreated = (newUser: AdminUser) => {
    setAdminData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          totalUsers: prev.stats.totalUsers + 1,
        },
        users: [newUser, ...(prev.users || [])],
      };
    });

    if (newUser.role === 'developer') {
      setDevelopers((prev) => [...prev, newUser]);
    }

    fetchAdminData(true);
  };

  const handleUserUpdated = (updatedUser: AdminUser) => {
    const targetId = updatedUser._id || updatedUser.id;

    setAdminData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        users: (prev.users || []).map((u) =>
          (u._id || u.id) === targetId ? { ...u, ...updatedUser } : u
        ),
      };
    });

    setDevelopers((prev) => syncDeveloperOnUpdate(prev, updatedUser));
    setActionSuccess(`User "${updatedUser.name}" (${updatedUser.email}) updated successfully.`);
    fetchAdminData(true);
  };

  const handleUserDeleted = (deletedUserId: string) => {
    setAdminData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          totalUsers: Math.max(0, prev.stats.totalUsers - 1),
        },
        users: (prev.users || []).filter((u) => (u._id || u.id) !== deletedUserId),
      };
    });

    setDevelopers((prev) => prev.filter((d) => (d._id || d.id) !== deletedUserId));
    setActionSuccess('User account successfully deleted.');
    fetchAdminData(true);
  };

  return {
    adminData,
    setAdminData,
    developers,
    isLoading,
    error,
    setError,
    actionSuccess,
    setActionSuccess,
    fetchAdminData,
    handleUpdateIssueStatus,
    handleAssignDeveloper,
    handleIssueUpdated,
    handleIssueDeleted,
    handleUserCreated,
    handleUserUpdated,
    handleUserDeleted,
    handleCommentAdded,
  };
};

export default useAdminDashboardData;
