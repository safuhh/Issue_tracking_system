import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  createIssue,
  getUserIssues,
  getAllIssues,
  updateIssue,
  deleteIssue,
} from "../controllers/issues/issue.crud.controller";
import {
  assignIssue,
  getAssignedIssues,
  getDevelopersList,
} from "../controllers/issues/issue.assignment.controller";
import {
  updateIssueStatus,
  getIssueStats,
  streamIssueEvents,
} from "../controllers/issues/issue.status.controller";
import {
  addComment,
  getIssueComments,
} from "../controllers/issues/issue.comment.controller";
import {
  validate,
  createIssueSchema,
  updateIssueSchema,
  updateIssueStatusSchema,
  assignIssueSchema,
  addCommentSchema,
} from "../validators";

const router = Router();

/**
 * Normal user endpoints
 */
// Submit new issue
router.post("/", authenticate, validate(createIssueSchema), createIssue);
// View user's own submitted issues
router.get("/my", authenticate, getUserIssues);

/**
 * Developer endpoints
 */
// View issues assigned to current developer
router.get(
  "/assigned",
  authenticate,
  authorize("developer", "admin"),
  getAssignedIssues,
);

/**
 * Real-time event stream
 */
router.get(
  "/stream",
  authenticate,
  authorize("admin", "developer"),
  streamIssueEvents,
);

/**
 * Admin endpoints
 */
// View all submitted issues
router.get("/", authenticate, authorize("admin"), getAllIssues);
// Get issue statistics for admin dashboard
router.get("/stats", authenticate, authorize("admin"), getIssueStats);
// Get list of developers for assignment dropdown
router.get("/developers", authenticate, authorize("admin"), getDevelopersList);
// Assign issue to developer
router.patch(
  "/:id/assign",
  authenticate,
  authorize("admin"),
  validate(assignIssueSchema),
  assignIssue,
);

/**
 * Comments on Issues:
 * POST: Developer assigned to issue (or admin) can comment
 * GET: Admin, assigned developer, or submitter can view comments
 */
router.post(
  "/:id/comments",
  authenticate,
  validate(addCommentSchema),
  addComment,
);

router.get("/:id/comments", authenticate, getIssueComments);

/**
 * Status management (Admin or Assigned Developer)
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "developer"),
  validate(updateIssueStatusSchema),
  updateIssueStatus,
);

/**
 * General Issue Edit and Delete endpoints (Admin or Issue Creator)
 */
router.put("/:id", authenticate, validate(updateIssueSchema), updateIssue);

router.patch("/:id", authenticate, validate(updateIssueSchema), updateIssue);

router.delete("/:id", authenticate, deleteIssue);

export default router;
