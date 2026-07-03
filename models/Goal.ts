import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetValue: number;
  currentValue: number;
  unit: string;
  status: "active" | "completed" | "paused" | "overdue";
  progressPercent: number;
  deadline: Date | null;
  tags: string[];
  milestones: {
    title: string;
    targetValue: number;
    completed: boolean;
    completedAt: Date | null;
  }[];
  progressNotes: {
    note: string;
    value: number;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["sales", "performance", "learning", "personal", "custom"],
      default: "performance",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: "units" },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "overdue"],
      default: "active",
    },
    progressPercent: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    tags: [{ type: String }],
    milestones: [
      {
        title: { type: String, required: true },
        targetValue: { type: Number, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
      },
    ],
    progressNotes: [
      {
        note: { type: String, default: "" },
        value: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: "goals", timestamps: true }
);

export default mongoose.models.Goal ||
  mongoose.model<IGoal>("Goal", GoalSchema);
