import mongoose, { Schema, Document } from "mongoose";

export interface IRequirement extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "pending" | "reviewing" | "approved" | "rejected" | "in-progress" | "completed";
  budget: number;
  currency: string;
  desiredStartDate: Date | null;
  desiredEndDate: Date | null;
  tags: string[];
  attachments: {
    url: string;
    name: string;
    type: string;
    uploadedAt: Date;
  }[];
  adminNotes: string;
  linkedProjectId: mongoose.Types.ObjectId | null;
  history: {
    from: string;
    to: string;
    changedBy: string;
    note: string;
    changedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "software", "hardware", "services", "consulting", "support", "other"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["draft", "pending", "reviewing", "approved", "rejected", "in-progress", "completed"],
      default: "pending",
    },
    budget: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    desiredStartDate: { type: Date, default: null },
    desiredEndDate: { type: Date, default: null },
    tags: [{ type: String }],
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, default: "file" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    adminNotes: { type: String, default: "" },
    linkedProjectId: { type: Schema.Types.ObjectId, default: null },
    history: [
      {
        from: { type: String, default: "" },
        to: { type: String, required: true },
        changedBy: { type: String, default: "system" },
        note: { type: String, default: "" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: "requirements", timestamps: true }
);

export default mongoose.models.Requirement ||
  mongoose.model<IRequirement>("Requirement", RequirementSchema);
