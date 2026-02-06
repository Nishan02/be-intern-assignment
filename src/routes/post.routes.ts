import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { authenticate } from "../middleware/auth.middleware"; // Import it
import { validate } from "../middleware/validation.middleware";
import { createPostSchema } from "../validations/post.validation";

const router = Router();

// Public: Anyone can see posts
router.get("/", PostController.getAll);
router.get("/:id", PostController.getOne);

// Protected: Must have x-user-id header
router.post("/", authenticate, validate(createPostSchema), PostController.create);
router.delete("/:id", authenticate, PostController.delete);

export default router;