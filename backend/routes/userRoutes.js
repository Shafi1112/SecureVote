import express from "express";
import { updateProfilePhoto } from "../controllers/userController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.put("/profile-photo", protect, upload.single("profilePhoto"), asyncHandler(updateProfilePhoto));

export default router;
