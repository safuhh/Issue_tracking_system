import mongoose, { Document, Schema } from 'mongoose';

export type IssueStatus = 'pending' | 'in-progress' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface IIssueComment {
  _id?: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  submittedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  comments: IIssueComment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IIssueComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1500,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'closed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Issue = mongoose.model<IIssue>('Issue', issueSchema);
export default Issue;
