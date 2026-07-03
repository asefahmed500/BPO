import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  color: string;
  progress: number;
  progressHistory: {
    percent: number;
    note: string;
    date: Date;
  }[];
  startDate: Date | null;
  endDate: Date | null;
  deadline: Date | null;
  budget: number;
  budgetSpent: number;
  tags: string[];
  teamMemberIds: mongoose.Types.ObjectId[];
  attachments: {
    url: string;
    name: string;
    type: string;
    uploadedAt: Date;
  }[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["planning", "active", "on-hold", "completed", "cancelled", "archived"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: { type: String, default: "general" },
    color: { type: String, default: "#292524" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    progressHistory: [
      {
        percent: { type: Number, default: 0 },
        note: { type: String, default: "" },
        date: { type: Date, default: Date.now },
      },
    ],
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    deadline: { type: Date, default: null },
    budget: { type: Number, default: 0 },
    budgetSpent: { type: Number, default: 0 },
    tags: [{ type: String }],
    teamMemberIds: [{ type: Schema.Types.ObjectId }],
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, default: "file" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "projects", timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
