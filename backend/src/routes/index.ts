import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import issueRoutes from './issue.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/issues', issueRoutes);

export default router;
