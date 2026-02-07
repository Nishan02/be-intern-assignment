import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Higher-order function to handle request body validation
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    // stripUnknown is vital here to keep junk out of the DB
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // map errors into a clean array and strip the Joi double quotes
      const errors = error.details.map(d => d.message.replace(/"/g, ''));
      return res.status(400).json({ errors });
    }

    // Overwrite req.body with the sanitized 'value' from Joi
    req.body = value;
    next();
  };
};