import { Response } from 'express';
import mongoose from 'mongoose';
import Issue, { IssuePriority } from '../../models/issue.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { issueEvents } from '../../utils/issueEvents';

/**
 * Controller: Create a new issue (Accessible by any authenticated user)
 */
export const createIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, description, priority } = req.body as {
      title: string;
      description: string;
      priority?: IssuePriority;
    };

    const newIssue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      status: 'pending',
      submittedBy: userId,
    });

    const populatedIssue = await newIssue.populate('submittedBy', 'name email role');

    // Notify listeners (e.g. admin dashboard) of new issue creation
    issueEvents.emit('change', {
      action: 'created',
      issueId: newIssue._id,
      status: newIssue.status,
    });

    res.status(201).json({
      success: true,
      message: 'Issue submitted successfully',
      issue: populatedIssue,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('createIssue error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error submitting issue',
    });
  }
};

/**
 * Controller: Get current user's submitted issues
 */
export const getUserIssues = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const issues = await Issue.find({ submittedBy: userId })
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
    console.error('getUserIssues error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user issues',
    });
  }
};

/**
 * Controller: Get all submitted issues (Admin access)
 */
export const getAllIssues = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    const { status, priority } = req.query as { status?: string; priority?: string };

    if (status && ['pending', 'in-progress', 'closed'].includes(status)) {
      filter.status = status;
    }
    if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
      filter.priority = priority;
    }

    const issues = await Issue.find(filter)
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
    console.error('getAllIssues error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving all issues',
    });
  }
};

/**
 * Controller: Update an existing issue (Admin can update all fields; Creator can update title, description, priority)
 */
export const updateIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
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

    const isCreator = issue.submittedBy.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isAdmin && !isCreator) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to edit this issue',
      });
      return;
    }

    const { title, description, priority, status, assignedTo } = req.body;

    if (title !== undefined) issue.title = title.trim();
    if (description !== undefined) issue.description = description.trim();
    if (priority !== undefined) issue.priority = priority;

    // Only Admin can change status or assignment via general update
    if (isAdmin) {
      if (status !== undefined) issue.status = status;
      if (assignedTo !== undefined) {
        if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
          issue.assignedTo = new mongoose.Types.ObjectId(assignedTo);
        } else {
          issue.assignedTo = undefined;
        }
      }
    }

    await issue.save();
    const populated = await issue.populate([
      { path: 'submittedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'comments.author', select: 'name email role' },
    ]);

    issueEvents.emit('change', {
      action: 'updated',
      issueId: issue._id,
      status: issue.status,
    });

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      issue: populated,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('updateIssue error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error updating issue',
    });
  }
};

/**
 * Controller: Delete an issue (Admin or Issue Creator)
 */
export const deleteIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
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

    const isCreator = issue.submittedBy.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isAdmin && !isCreator) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this issue',
      });
      return;
    }

    await Issue.findByIdAndDelete(id);

    issueEvents.emit('change', {
      action: 'deleted',
      issueId: id,
    });

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('deleteIssue error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error deleting issue',
    });
  }
};
