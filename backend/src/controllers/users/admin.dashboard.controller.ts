import { Response } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from '../../models/user.model';
import Issue from '../../models/issue.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { SafeUserDTO, toSafeUserDTO } from './user.dto';

/**
 * Controller: Get Admin Dashboard Data
 * Returns aggregate metrics, system health, and the recent user & issue directory.
 */
export const getAdminDashboardData = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers,
      activeRoles,
      totalIssues,
      pendingIssues,
      inProgressIssues,
      closedIssues,
      rawUsers,
      allIssues,
    ] = await Promise.all([
      User.countDocuments(),
      User.distinct('role'),
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'closed' }),
      User.find()
        .select('_id name email role createdBy createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Issue.find()
        .populate('submittedBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('comments.author', 'name email role')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Determine database connectivity health dynamically
    const dbState = mongoose.connection.readyState;
    const systemStatus = dbState === 1 ? 'Operational' : 'Degraded';

    const users: SafeUserDTO[] = rawUsers.map((u) =>
      toSafeUserDTO({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        createdBy: u.createdBy,
        createdAt: u.createdAt,
      })
    );

    res.status(200).json({
      success: true,
      message: 'Admin-only data accessed successfully',
      stats: {
        totalUsers,
        activeRoles:
          activeRoles.length > 0 ? activeRoles : ['admin', 'developer', 'user'],
        systemStatus,
        uptime: Math.floor(process.uptime()),
        issueStats: {
          total: totalIssues,
          pending: pendingIssues,
          inProgress: inProgressIssues,
          closed: closedIssues,
        },
      },
      users,
      issues: allIssues,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown database error';
    console.error('getAdminDashboardData error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error loading admin dashboard data',
    });
  }
};
