import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  taskType: "task" | "bug" | "feature" | "improvement" | "research";
  assigneeId: mongoose.Types.ObjectId | null;
  reporterId: mongoose.Types.ObjectId | null;
  estimatedHours: number;
  loggedHours: number;
  dueDate: Date | null;
  completedAt: Date | null;
  tags: string[];
  labels: string[];
  subtasks: {
    title: string;
    completed: boolean;
    completedAt: Date | null;
  }[];
  comments: {
    authorId: mongoose.Types.ObjectId;
    authorName: string;
    content: string;
    createdAt: Date;
  }[];
  attachments: {
    url: string;
    name: string;
    type: string;
  }[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["backlog", "todo", "in-progress", "review", "done", "blocked"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    taskType: {
      type: String,
      enum: ["task", "bug", "feature", "improvement", "research"],
      default: "task",
    },
    assigneeId: { type: Schema.Types.ObjectId, default: null },
    reporterId: { type: Schema.Types.ObjectId, default: null },
    estimatedHours: { type: Number, default: 0 },
    loggedHours: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    tags: [{ type: String }],
    labels: [{ type: String }],
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
      },
    ],
    comments: [
      {
        authorId: { type: Schema.Types.ObjectId },
        authorName: { type: String, default: "" },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        url: { type: String },
        name: { type: String },
        type: { type: String, default: "file" },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { collection: "tasks", timestamps: true }
);

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
