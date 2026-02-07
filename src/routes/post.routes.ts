import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { auth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createPostSchema, updatePostSchema } from '../validations/post.validation';

const router = Router();

// Tag search - separate from CRUD for clarity
// Note: test script relies on this specific path
router.get("/hashtag/:tag", PostController.getByHashtag);

// Public feed access
router.get("/", PostController.getAll);
router.get("/:id", PostController.getOne);

// Protected routes - requires 'x-user-id' header
router.post("/", auth, validateBody(createPostSchema), PostController.create);
router.put("/:id", auth, validateBody(updatePostSchema), PostController.update);
router.delete("/:id", auth, PostController.delete);

export default router;