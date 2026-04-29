import AuditLog from "../models/AuditLog.js";
import Election from "../models/Election.js";
import User from "../models/User.js";
import Vote from "../models/Vote.js";

export const adminSummary = async (req, res) => {
  const [users, elections, votes, activeElections] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Election.countDocuments(),
    Vote.countDocuments(),
    Election.countDocuments({ isActive: true, startTime: { $lte: new Date() }, endTime: { $gte: new Date() } })
  ]);

  res.json({ users, elections, votes, activeElections });
};

export const listUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const deleteUser = async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    return res.status(400).json({ message: "You cannot delete your own admin account" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const votes = await Vote.find({ user: user._id });
  await Promise.all(
    votes.map((vote) =>
      Election.updateOne(
        { _id: vote.election, "candidates._id": vote.candidate },
        { $inc: { "candidates.$.votes": -1 } }
      )
    )
  );

  await Vote.deleteMany({ user: user._id });
  await User.findByIdAndDelete(user._id);
  await AuditLog.create({
    admin: req.user._id,
    action: "DELETE_USER",
    entity: "User",
    entityId: user._id,
    metadata: { email: user.email, removedVotes: votes.length }
  });

  res.json({ message: "User deleted successfully" });
};

export const listAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().populate("admin", "name email").sort({ createdAt: -1 }).limit(100);
  res.json(logs);
};
