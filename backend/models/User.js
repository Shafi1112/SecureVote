import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    voterId: { type: String, unique: true, index: true },
    profilePhoto: { type: String, default: "" },
    emailVerificationOtp: { type: String, select: false },
    emailVerificationOtpExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function ensureVoterId(next) {
  if (!this.voterId) {
    this.voterId = `SV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createEmailVerificationOtp = function createEmailVerificationOtp() {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.emailVerificationOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailVerificationOtpExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return token;
};

export default mongoose.model("User", userSchema);
