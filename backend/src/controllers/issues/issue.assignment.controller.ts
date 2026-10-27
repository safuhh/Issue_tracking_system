import { Response } from 'express';
import mongoose from 'mongoose';
import Issue from '../../models/issue.model';
import User from '../../models/user.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { issueEvents } from '../../utils/issueEvents';

/**
 * Controller: Get issues assigned to the logged-in developer
 */
export const getAssignedIssues = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const issues = await Issue.find({ assignedTo: userId })
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('comments.author', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      issues,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getAssignedIssues error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assigned issues',
    });
  }
};

/**
 * Controller: Assign an issue to a developer (Admin only)
 */
export const assignIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { developerId } = req.body as { developerId?: string | null };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid issue ID format' });
      return;
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    if (developerId && developerId.trim()) {
      if (!mongoose.Types.ObjectId.isValid(developerId)) {
        res.status(400).json({ success: false, message: 'Invalid developer ID format' });
        return;
      }

      const developer = await User.findById(developerId);
      if (!developer || developer.role !== 'developer') {
        res.status(400).json({
          success: false,
          message: 'The selected user is not a registered developer',
        });
        return;
      }

      issue.assignedTo = developer._id as mongoose.Types.ObjectId;
    } else {
      issue.assignedTo = undefined;
    }

    await issue.save();
    const populated = await issue.populate([
      { path: 'submittedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'comments.author', select: 'name email role' },
    ]);

    // Emit live change event for real-time synchronization
    issueEvents.emit('change', {
      action: 'assigned',
      issueId: issue._id,
      assignedTo: issue.assignedTo,
    });

    res.status(200).json({
      success: true,
      message: issue.assignedTo
        ? 'Issue successfully assigned to developer'
        : 'Issue unassigned successfully',
      issue: populated,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('assignIssue error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error assigning issue',
    });
  }
};

/**
 * Controller: Get active developers list for issue assignment dropdown (Admin access)
 */
export const getDevelopersList = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const developers = await User.find({ role: 'developer' })
      .select('_id name email role createdAt')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      developers,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getDevelopersList error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving developers list',
    });
  }
};
