import crypto from "crypto";
import User from "../models/User.js";
import { authResponse, signToken } from "../utils/tokens.js";
import { resetEmail, sendEmail, verificationEmail } from "../utils/email.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email is already registered" });

  const user = new User({ name, email, password });
  const otp = user.createEmailVerificationOtp();
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your SecureVote verification OTP",
    html: verificationEmail(user.name, otp)
  });

  res.status(201).json({
    message: "Registration successful. Please check your email for the OTP.",
    email: user.email
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json(authResponse(user, signToken(user)));
};

export const verifyEmailOtp = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    emailVerificationOtp: hashToken(req.body.otp),
    emailVerificationOtpExpires: { $gt: Date.now() }
  }).select("+emailVerificationOtp");
  if (!user) return res.status(400).json({ message: "OTP is invalid or expired" });

  user.isEmailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpires = undefined;
  await user.save();

  res.json({ message: "Email verified successfully" });
};

export const resendEmailOtp = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "Account not found" });
  if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified" });

  const otp = user.createEmailVerificationOtp();
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: "Your SecureVote verification OTP",
    html: verificationEmail(user.name, otp)
  });

  res.json({ message: "A new OTP has been sent to your email." });
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your SecureVote password",
      html: resetEmail(user.name, resetUrl)
    });
  }

  res.json({ message: "If that account exists, a reset link has been sent." });
};

export const resetPassword = async (req, res) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(req.params.token),
    passwordResetExpires: { $gt: Date.now() }
  }).select("+password");
  if (!user) return res.status(400).json({ message: "Reset link is invalid or expired" });

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successfully" });
};

export const me = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isEmailVerified: req.user.isEmailVerified,
    voterId: req.user.voterId,
    profilePhoto: req.user.profilePhoto
  });
};
