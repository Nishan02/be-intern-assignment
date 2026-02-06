import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { validate } from "../middleware/validation.middleware";
import { createPostSchema, updatePostSchema } from "../validations/post.validation";

const router = Router();

router.get("/", PostController.getAll);
router.get("/:id", PostController.getOne);
router.post("/", validate(createPostSchema), PostController.create);
router.put("/:id", validate(updatePostSchema), PostController.update);
router.delete("/:id", PostController.delete);

export default router;