import { Response } from 'express';
import mongoose from 'mongoose';
import Issue, { IssueStatus } from '../../models/issue.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { issueEvents } from '../../utils/issueEvents';

/**
 * Controller: Update issue status (Admin or Assigned Developer)
 */
export const updateIssueStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: IssueStatus };
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid issue ID format' });
      return;
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    // Role-based permission enforcement:
    // Developers can ONLY update the status of issues explicitly assigned to them!
    if (userRole === 'developer') {
      if (!issue.assignedTo || issue.assignedTo.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update the status of issues assigned to you.',
        });
        return;
      }
    }

    if (status) {
      issue.status = status;
    }

    await issue.save();
    const populated = await issue.populate([
      { path: 'submittedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'comments.author', select: 'name email role' },
    ]);

    // Broadcast update so Admin Dashboard statistics and lists update automatically
    issueEvents.emit('change', {
      action: 'status_updated',
      issueId: issue._id,
      status: issue.status,
      updatedByRole: userRole,
    });

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${issue.status}`,
      issue: populated,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('updateIssueStatus error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error updating issue status',
    });
  }
};

/**
 * Controller: Get issue statistics for admin dashboard
 */
export const getIssueStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [total, pending, inProgress, closed] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'closed' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        closed,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getIssueStats error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving issue statistics',
    });
  }
};

/**
 * Controller: Server-Sent Events stream for real-time issue updates (Admin and Developer)
 */
export const streamIssueEvents = (req: AuthRequest, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

  const onIssueChange = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  issueEvents.on('change', onIssueChange);

  req.on('close', () => {
    issueEvents.off('change', onIssueChange);
  });
};
