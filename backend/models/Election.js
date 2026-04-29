import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    party: { type: String, trim: true, maxlength: 80 },
    manifesto: { type: String, trim: true, maxlength: 500 },
    image: { type: String, default: "" },
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 800 },
    candidates: [candidateSchema],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

electionSchema.virtual("status").get(function status() {
  const now = new Date();
  if (!this.isActive) return "inactive";
  if (now < this.startTime) return "scheduled";
  if (now > this.endTime) return "ended";
  return "active";
});

electionSchema.set("toJSON", { virtuals: true });
electionSchema.set("toObject", { virtuals: true });

export default mongoose.model("Election", electionSchema);
