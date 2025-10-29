import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const authSchemas = {
  sendCode: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid phone number format'
      })
  }),

  verifyCode: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    code: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': 'Code must be 6 digits',
        'string.pattern.base': 'Code must contain only digits'
      })
  })
};

export const characterSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Character name is required',
        'string.max': 'Character name must not exceed 100 characters'
      })
  }),

  update: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .optional()
  })
};

export const userSchemas = {
  updateProfile: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    email: Joi.string().email().optional()
  })
};
