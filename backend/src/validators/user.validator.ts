import Joi from 'joi';

/**
 * Schema for Admin creating a new user
 */
export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name cannot exceed {#limit} characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password cannot exceed {#limit} characters',
    'any.required': 'Password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm password',
  }),
  role: Joi.string().valid('user', 'developer').required().messages({
    'any.only': 'Role must be either "user" or "developer"',
    'any.required': 'Role is required',
  }),
});

/**
 * Schema for Admin updating an existing user's email, password, and role
 */
export const updateUserByAdminSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).lowercase().optional().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please enter a valid email address',
  }),
  password: Joi.string().min(6).max(128).optional().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password cannot exceed {#limit} characters',
  }),
  confirmPassword: Joi.when('password', {
    is: Joi.exist(),
    then: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm new password',
    }),
    otherwise: Joi.optional(),
  }),
  role: Joi.string().valid('user', 'developer').optional().messages({
    'any.only': 'Role must be either "user" or "developer"',
  }),
})
  .or('email', 'password', 'role')
  .messages({
    'object.missing': 'At least email, password, or role must be provided to update',
  });
