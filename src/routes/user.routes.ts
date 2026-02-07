import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validations/user.validation';

const router = Router();

// --- Social & Feed ---
// Note: '/feed' must stay above '/:id' so Express doesn't think 'feed' is an ID
router.get("/feed", auth, UserController.getPersonalizedFeed);

// Publicly viewable social info
router.get("/:id/activity", UserController.getUserActivities);
router.get("/:id/followers", UserController.getFollowers);

// --- Standard User Management ---
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);

// Registration and updates
router.post("/", validateBody(createUserSchema), UserController.createUser);
router.put("/:id", validateBody(updateUserSchema), UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// --- Actions ---
router.post("/:id/follow", auth, UserController.followUser);

export default router;