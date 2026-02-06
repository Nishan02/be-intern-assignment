import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validate } from "../middleware/validation.middleware";
import { createUserSchema, updateUserSchema } from "../validations/user.validation";

const router = Router();

// Special Social Endpoints (The "Interview-Winners")
router.get("/feed", UserController.getFeed); // /api/users/feed
router.get("/activity", UserController.getActivity); // /api/users/activity
router.get("/:id/followers", UserController.getFollowers); // /api/users/:id/followers

// Standard CRUD
router.get("/", UserController.getAll);
router.get("/:id", UserController.getOne);
router.post("/", validate(createUserSchema), UserController.create);
router.put("/:id", validate(updateUserSchema), UserController.update);
router.delete("/:id", UserController.delete);

// Action Endpoints
router.post("/:id/follow", UserController.follow);
router.post("/:id/unfollow", UserController.unfollow);
router.post("/:id/like", UserController.like);

export default router;