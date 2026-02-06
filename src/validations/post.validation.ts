import Joi from "joi";

export const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(280).required(),
  authorId: Joi.number().required(),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(280),
});