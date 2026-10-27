import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Controller: Health check endpoint for monitoring services (e.g. UptimeRobot)
 * Accessible without authentication.
 * Returns HTTP 200 with API status, current timestamp, uptime, and database connectivity.
 */
export const getHealth = (_req: Request, res: Response): void => {
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Server is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatusMap[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
  });
};
