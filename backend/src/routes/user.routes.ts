import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getMe } from '../controllers/auth.controller';
import { getAdminDashboardData } from '../controllers/users/admin.dashboard.controller';
import {
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from '../controllers/users/user.management.controller';
import { getDeveloperDashboardData } from '../controllers/users/developer.dashboard.controller';
import { validate, createUserSchema, updateUserByAdminSchema } from '../validators';

const router = Router();

/**
 * Profile route — accessible by any authenticated user
 */
router.get('/profile', authenticate, getMe);

/**
 * Admin routes — accessible by admin role only
 */
router.get('/admin', authenticate, authorize('admin'), getAdminDashboardData);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createUserSchema),
  createUserByAdmin
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateUserByAdminSchema),
  updateUserByAdmin
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateUserByAdminSchema),
  updateUserByAdmin
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteUserByAdmin
);

/**
 * Developer route — accessible by admin and developer roles
 */
router.get(
  '/dev',
  authenticate,
  authorize('admin', 'developer'),
  getDeveloperDashboardData
);

export default router;
