import express from "express";
import { adminSummary, deleteUser, listAuditLogs, listUsers } from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/summary", asyncHandler(adminSummary));
router.get("/users", asyncHandler(listUsers));
router.delete("/users/:id", asyncHandler(deleteUser));
router.get("/audit-logs", asyncHandler(listAuditLogs));

export default router;
