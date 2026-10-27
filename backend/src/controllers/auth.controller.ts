import { Request, Response, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

// ─── Password helpers ─────────────────────────────────────────────────────────

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (candidatePassword: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hash);
};

// ─── Token helpers ───────────────────────────────────────────────────────────

const signAccessToken = (payload: { id: string; email: string; role: string }): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET not configured');
  return (jwt.sign as any)(payload, secret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
};

const signRefreshToken = (payload: { id: string }): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET not configured');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

// ─── Register ────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'This email address is already registered. Please sign in or use a different email.',
      });
      return;
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);

    // Public registration ALWAYS assigns the 'user' role — client input for role is strictly ignored
    const user = await User.create({ name, email, password: hashedPassword, role: 'user' });

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'This email address is already registered. Please sign in or use a different email.',
      });
    } else if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages[0] });
    } else {
      console.error('Register error:', err);
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Explicitly select password and refreshToken (both are select:false)
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─── Refresh Token ───────────────────────────────────────────────────────────

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token: string | undefined = req.cookies?.refreshToken;

    if (!token) {
      res.status(200).json({
        success: false,
        authenticated: false,
        message: 'No active session',
      });
      return;
    }

    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error('REFRESH_TOKEN_SECRET not configured');

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, secret) as { id: string };
    } catch {
      res.clearCookie('refreshToken', clearCookieOptions);
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    const user = await User.findById(decoded.id).select('+refreshToken +previousRefreshToken');
    if (!user) {
      res.clearCookie('refreshToken', clearCookieOptions);
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = user.refreshToken === token || user.previousRefreshToken === token;
    if (!isMatch) {
      // Token reuse detected or invalid token
      res.clearCookie('refreshToken', clearCookieOptions);
      res.status(401).json({ success: false, message: 'Refresh token is invalid' });
      return;
    }

    const newAccessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user.id });

    // Rotate refresh token and keep previous token in grace window for concurrent requests
    user.previousRefreshToken = user.refreshToken;
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ success: false, message: 'Server error during token refresh' });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token: string | undefined = req.cookies?.refreshToken;

    if (token) {
      // Invalidate refresh token in DB
      await User.findOneAndUpdate(
        { $or: [{ refreshToken: token }, { previousRefreshToken: token }] },
        { $unset: { refreshToken: '', previousRefreshToken: '' } }
      );
    }

    res.clearCookie('refreshToken', clearCookieOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

// ─── Get current user ────────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
