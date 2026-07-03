import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
  clientId: string;
  sessionType: "guest" | "user";
  userId: mongoose.Types.ObjectId | null;
  userName: string;
  userEmail: string;
  userRole: string;
  visitorName: string;
  visitorEmail: string;
  status: "waiting" | "active" | "closed";
  assignedTo: mongoose.Types.ObjectId | null;
  lastMessageAt: Date;
  lastMessageContent: string;
  unreadForSupport: number;
  unreadForGuest: number;
  unreadForUser: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    clientId: { type: String, required: true, index: true },
    sessionType: { type: String, enum: ["guest", "user"], default: "guest", index: true },
    userId: { type: Schema.Types.ObjectId, default: null, index: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    userRole: { type: String, default: "" },
    visitorName: { type: String, default: "Guest" },
    visitorEmail: { type: String, default: "" },
    status: {
      type: String,
      enum: ["waiting", "active", "closed"],
      default: "waiting",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, default: null },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageContent: { type: String, default: "" },
    unreadForSupport: { type: Number, default: 0 },
    unreadForGuest: { type: Number, default: 0 },
    unreadForUser: { type: Number, default: 0 },
  },
  { collection: "chat_sessions", timestamps: true }
);

ChatSessionSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
