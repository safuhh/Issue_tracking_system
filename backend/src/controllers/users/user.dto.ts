import mongoose from 'mongoose';
import { UserRole } from '../../models/user.model';

/**
 * Safe user response transfer object (DTO)
 */
export interface SafeUserDTO {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdBy?: string;
  createdAt: Date;
}

/**
 * Helper to map a user document to an explicitly allowed, safe DTO.
 */
export const toSafeUserDTO = (user: {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  role: UserRole;
  createdBy?: mongoose.Types.ObjectId | string | null;
  createdAt: Date;
}): SafeUserDTO => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdBy: user.createdBy ? user.createdBy.toString() : undefined,
  createdAt: user.createdAt,
});
