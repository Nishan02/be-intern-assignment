import Joi from "joi";

export const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(280).required(),
  hashtags: Joi.array().items(Joi.string().min(1).max(50)).optional(),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(280),
  hashtags: Joi.array().items(Joi.string().min(1).max(50)),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
