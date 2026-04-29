import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

voteSchema.index({ election: 1, user: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
