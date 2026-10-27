import Joi from 'joi';

/**
 * Schema for creating a new issue
 */
export const createIssueSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().messages({
    'string.base': 'Title must be a string',
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least {#limit} characters long',
    'string.max': 'Title cannot exceed {#limit} characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().min(5).max(2000).required().messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description cannot be empty',
    'string.min': 'Description must be at least {#limit} characters long',
    'string.max': 'Description cannot exceed {#limit} characters',
    'any.required': 'Description is required',
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional().messages({
    'any.only': 'Priority must be one of: low, medium, high, critical',
  }),
});

/**
 * Schema for updating issue content (title, description, priority, status, assignedTo)
 */
export const updateIssueSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).optional().messages({
    'string.base': 'Title must be a string',
    'string.min': 'Title must be at least {#limit} characters long',
    'string.max': 'Title cannot exceed {#limit} characters',
  }),
  description: Joi.string().trim().min(5).max(2000).optional().messages({
    'string.base': 'Description must be a string',
    'string.min': 'Description must be at least {#limit} characters long',
    'string.max': 'Description cannot exceed {#limit} characters',
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional().messages({
    'any.only': 'Priority must be one of: low, medium, high, critical',
  }),
  status: Joi.string().valid('pending', 'in-progress', 'closed').optional().messages({
    'any.only': 'Status must be one of: pending, in-progress, closed',
  }),
  assignedTo: Joi.string().allow(null, '').optional(),
});

/**
 * Schema for updating issue status
 */
export const updateIssueStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-progress', 'closed').required().messages({
    'any.only': 'Status must be one of: pending, in-progress, closed',
    'any.required': 'Status is required',
  }),
  assignedTo: Joi.string().optional().allow(null, ''),
});

/**
 * Schema for assigning issue to developer
 */
export const assignIssueSchema = Joi.object({
  developerId: Joi.string().allow(null, '').required().messages({
    'any.required': 'developerId field is required',
  }),
});

/**
 * Schema for adding a comment to an issue
 */
export const addCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1500).required().messages({
    'string.base': 'Comment content must be a string',
    'string.empty': 'Comment cannot be empty',
    'string.min': 'Comment must be at least {#limit} character long',
    'string.max': 'Comment cannot exceed {#limit} characters',
    'any.required': 'Comment content is required',
  }),
});
