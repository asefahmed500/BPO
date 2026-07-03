import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  sessionId: mongoose.Types.ObjectId;
  senderType: "guest" | "support" | "ai" | "user";
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    senderType: {
      type: String,
      enum: ["guest", "support", "ai", "user"],
      required: true,
    },
    senderId: { type: String, required: true },
    senderName: { type: String, default: "" },
    content: { type: String, required: true },
  },
  { collection: "chat_messages", timestamps: true }
);

export default mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
