import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

type RequestProperty = 'body' | 'query' | 'params';

/**
 * Express middleware to validate incoming request data using Joi
 * @param schema Joi schema to validate against
 * @param property Request property to validate ('body' | 'query' | 'params'), default: 'body'
 */
export const validate = (schema: Schema, property: RequestProperty = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Strip fields not present in schema
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Replace request property with validated and stripped values
    req[property] = value;
    next();
  };
};
