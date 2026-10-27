import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, registerSchema, loginSchema } from '../validators';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
