import Joi from 'joi';

// Common constraints to avoid repetition
const nameStr = Joi.string().min(2).max(255);
const emailStr = Joi.string().email().max(255);

export const createUserSchema = Joi.object({
  firstName: nameStr.required().messages({
    'string.empty': 'First name is required',
    'string.min': 'Name is too short (min 2 chars)'
  }),
  
  lastName: nameStr.required().messages({
    'string.empty': 'Last name is required'
  }),

  email: emailStr.required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is a required field'
  })
});

export const updateUserSchema = Joi.object({
  firstName: nameStr,
  lastName: nameStr,
  email: emailStr
})
.min(1) // Ensure they aren't sending an empty {} body
.messages({
  'object.min': 'Provide at least one field to update'
});