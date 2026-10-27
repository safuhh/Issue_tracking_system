import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Public health check endpoint for monitoring and uptime pinging (e.g. UptimeRobot)
 * @access  Public (No authentication required)
 */
router.get('/', getHealth);

export default router;
