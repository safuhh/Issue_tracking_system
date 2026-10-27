import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../../models/user.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { toSafeUserDTO } from './user.dto';

/**
 * Controller: Admin Create User
 * Allows administrator to create accounts with either 'user' or 'developer' role.
 */
export const createUserByAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role: 'user' | 'developer';
    };

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();

    // Check for existing user with normalized email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
      return;
    }

    // Hash password with bcrypt (salt cost factor 12)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: toSafeUserDTO(newUser),
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
      return;
    }

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('createUserByAdmin error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error creating user',
    });
  }
};

/**
 * Controller: Admin Update User
 * Allows an administrator to update the email, password, and role of users they have created.
 */
export const updateUserByAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: 'user' | 'developer';
    };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const adminId = req.user?.id;

    // RBAC: Check that admin can only update users they have created
    if (targetUser.createdBy && targetUser.createdBy.toString() !== adminId) {
      res.status(403).json({
        success: false,
        message: 'You can only update users that you have created.',
      });
      return;
    }

    // Do not allow updating other administrator accounts
    if (targetUser.role === 'admin' && targetUser._id.toString() !== adminId) {
      res.status(403).json({
        success: false,
        message: 'Cannot update other administrator accounts.',
      });
      return;
    }

    // If targetUser had no createdBy recorded previously, attribute to this admin
    if (!targetUser.createdBy && adminId) {
      targetUser.createdBy = adminId;
    }

    // Update email if provided and different
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== targetUser.email) {
        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: targetUser._id },
        });
        if (existingEmail) {
          res.status(409).json({
            success: false,
            message: 'A user with this email address already exists.',
          });
          return;
        }
        targetUser.email = normalizedEmail;
      }
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(12);
      targetUser.password = await bcrypt.hash(password, salt);
    }

    // Update role if provided
    if (role && (role === 'user' || role === 'developer')) {
      targetUser.role = role;
    }

    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: toSafeUserDTO(targetUser),
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
      return;
    }

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('updateUserByAdmin error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error updating user',
    });
  }
};

/**
 * Controller: Admin Delete User
 * Allows an administrator to delete accounts they have created.
 */
export const deleteUserByAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const adminId = req.user?.id;

    // Prevent self-deletion
    if (targetUser._id.toString() === adminId) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
      });
      return;
    }

    // Do not allow deleting other administrator accounts
    if (targetUser.role === 'admin') {
      res.status(403).json({
        success: false,
        message: 'Cannot delete administrative accounts.',
      });
      return;
    }

    // RBAC: Check that admin can only delete users they have created
    if (targetUser.createdBy && targetUser.createdBy.toString() !== adminId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete users that you have created.',
      });
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User "${targetUser.name}" (${targetUser.email}) deleted successfully`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('deleteUserByAdmin error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
    });
  }
};
