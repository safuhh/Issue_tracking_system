import { Request, Response } from 'express';
import User from '../../models/user.model';

/**
 * Controller: Get Developer Dashboard Data
 * Returns sprint telemetry and diagnostic information for developers and admins.
 */
export const getDeveloperDashboardData = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Measure live database query latency
    const startTime = process.hrtime();
    await User.findOne().select('_id').lean();
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const latencyMs = Math.max(
      1,
      Math.round(seconds * 1000 + nanoseconds / 1e6)
    );

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Developer portal accessed successfully',
      devData: {
        activeSprint: 'Sprint 24 - Core Issue Tracking',
        gitBranch: process.env.GIT_BRANCH || 'main',
        environment: process.env.NODE_ENV || 'development',
        apiLatency: `${latencyMs}ms`,
        activeDeployments: Math.max(1, Math.min(5, Math.ceil(totalUsers / 3))),
        issues: [
          {
            id: 'ISS-201',
            title: 'Implement RBAC developer portal API',
            priority: 'High',
            status: 'In Review',
          },
          {
            id: 'ISS-202',
            title: 'Optimize query index on user refreshToken',
            priority: 'Medium',
            status: 'Open',
          },
          {
            id: 'ISS-203',
            title: 'Configure silent refresh retry queue',
            priority: 'Low',
            status: 'Resolved',
          },
        ],
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getDeveloperDashboardData error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error loading developer data',
    });
  }
};
