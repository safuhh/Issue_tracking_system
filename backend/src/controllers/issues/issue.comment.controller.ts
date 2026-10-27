import { Response } from 'express';
import mongoose from 'mongoose';
import Issue from '../../models/issue.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { issueEvents } from '../../utils/issueEvents';

/**
 * Controller: Add a comment to an issue (Authorized for assigned developer and admin)
 */
export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body as { content: string };
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid issue ID format' });
      return;
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    // RBAC: Developer must be assigned to this issue; Admin has access
    const isAssignedDev = issue.assignedTo && issue.assignedTo.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isAssignedDev && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only the assigned developer or an administrator can comment on this issue.',
      });
      return;
    }

    const newComment = {
      content: content.trim(),
      author: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
    };

    issue.comments.push(newComment as any);
    await issue.save();

    const populated = await issue.populate([
      { path: 'submittedBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'comments.author', select: 'name email role' },
    ]);

    issueEvents.emit('change', {
      action: 'comment_added',
      issueId: issue._id,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comments: populated.comments,
      issue: populated,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('addComment error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment',
    });
  }
};

/**
 * Controller: Get comments for an issue with RBAC verification
 * Accessible to:
 * 1. Admin
 * 2. Assigned Developer
 * 3. Normal User who created the issue
 */
export const getIssueComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid issue ID format' });
      return;
    }

    const issue = await Issue.findById(id).populate([
      { path: 'comments.author', select: 'name email role' },
    ]);

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    // Role-based access control:
    // Only Admin, the Assigned Developer, or the Submitter can view comments!
    const isCreator = issue.submittedBy.toString() === userId;
    const isAssignedDev = issue.assignedTo && issue.assignedTo.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isAssignedDev && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view comments for this issue.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      comments: issue.comments,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getIssueComments error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving comments',
    });
  }
};
