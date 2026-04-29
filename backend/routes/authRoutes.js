import express from "express";
import { body } from "express-validator";
import { forgotPassword, login, me, register, resendEmailOtp, resetPassword, verifyEmailOtp } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email"),
    body("password").isStrongPassword({ minLength: 8, minSymbols: 0 }).withMessage("Use a stronger password")
  ],
  validate,
  asyncHandler(register)
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  asyncHandler(login)
);

router.post(
  "/verify-email-otp",
  [body("email").isEmail().normalizeEmail(), body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Enter the 6-digit OTP")],
  validate,
  asyncHandler(verifyEmailOtp)
);
router.post("/resend-email-otp", [body("email").isEmail().normalizeEmail()], validate, asyncHandler(resendEmailOtp));
router.post("/forgot-password", [body("email").isEmail().normalizeEmail()], validate, asyncHandler(forgotPassword));
router.post(
  "/reset-password/:token",
  [body("password").isStrongPassword({ minLength: 8, minSymbols: 0 }).withMessage("Use a stronger password")],
  validate,
  asyncHandler(resetPassword)
);
router.get("/me", protect, asyncHandler(me));

export default router;
