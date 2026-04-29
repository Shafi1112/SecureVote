import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

await connectDB();

const email = process.env.ADMIN_EMAIL || "admin@securevote.local";
const exists = await User.findOne({ email }).select("+password");

if (!exists) {
  await User.create({
    name: process.env.ADMIN_NAME || "SecureVote Admin",
    email,
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
    role: "admin",
    isEmailVerified: true
  });
  console.log(`Admin created: ${email}`);
} else {
  exists.name = process.env.ADMIN_NAME || exists.name;
  exists.password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  exists.role = "admin";
  exists.isEmailVerified = true;
  await exists.save();
  console.log(`Admin synced: ${email}`);
}

process.exit(0);
