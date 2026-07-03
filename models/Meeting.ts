import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  title: string;
  description: string;
  agenda: string;
  agendaItems: {
    title: string;
    duration: number;
    completed: boolean;
  }[];
  scheduledAt: Date;
  endDate: Date | null;
  duration: number;
  timezone: string;
  location: string;
  meetingLink: string;
  type: "one-on-one" | "team" | "client" | "review" | "standup";
  recurring: "none" | "daily" | "weekly" | "biweekly" | "monthly";
  recurringParentId: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  participantIds: mongoose.Types.ObjectId[];
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";
  minutes: string;
  actionItems: {
    title: string;
    assigneeId: mongoose.Types.ObjectId | null;
    dueDate: Date | null;
    completed: boolean;
  }[];
  remindersSent: number[];
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    agenda: { type: String, default: "" },
    agendaItems: [
      {
        title: { type: String, required: true },
        duration: { type: Number, default: 15 },
        completed: { type: Boolean, default: false },
      },
    ],
    scheduledAt: { type: Date, required: true },
    endDate: { type: Date, default: null },
    duration: { type: Number, default: 30 },
    timezone: { type: String, default: "UTC" },
    location: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    type: {
      type: String,
      enum: ["one-on-one", "team", "client", "review", "standup"],
      default: "one-on-one",
    },
    recurring: {
      type: String,
      enum: ["none", "daily", "weekly", "biweekly", "monthly"],
      default: "none",
    },
    recurringParentId: { type: Schema.Types.ObjectId, default: null },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    participantIds: [{ type: Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    minutes: { type: String, default: "" },
    actionItems: [
      {
        title: { type: String, required: true },
        assigneeId: { type: Schema.Types.ObjectId, default: null },
        dueDate: { type: Date, default: null },
        completed: { type: Boolean, default: false },
      },
    ],
    remindersSent: [{ type: Number }],
  },
  { collection: "meetings", timestamps: true }
);

export default mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
