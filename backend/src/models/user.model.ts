import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'developer';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
  previousRefreshToken?: string;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'developer'],
      default: 'user',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    previousRefreshToken: {
      type: String,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
