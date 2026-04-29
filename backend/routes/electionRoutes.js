import express from "express";
import { body } from "express-validator";
import {
  addCandidate,
  castVote,
  createElection,
  getElection,
  getResults,
  listElections,
  toggleElection
} from "../controllers/electionController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authorize, protect, requireVerified } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", protect, asyncHandler(listElections));
router.get("/:id", protect, asyncHandler(getElection));
router.get("/:id/results", protect, asyncHandler(getResults));

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("title").trim().isLength({ min: 3 }).withMessage("Title is required"),
    body("startTime").isISO8601().withMessage("Start time is required"),
    body("endTime").isISO8601().withMessage("End time is required")
  ],
  validate,
  asyncHandler(createElection)
);

router.post(
  "/:id/candidates",
  protect,
  authorize("admin"),
  upload.single("candidateImage"),
  [body("name").trim().isLength({ min: 2 }).withMessage("Candidate name is required")],
  validate,
  asyncHandler(addCandidate)
);

router.patch("/:id/status", protect, authorize("admin"), asyncHandler(toggleElection));

router.post(
  "/:id/vote",
  protect,
  requireVerified,
  [body("candidateId").isMongoId().withMessage("Candidate is required")],
  validate,
  asyncHandler(castVote)
);

export default router;
