import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participantIds: mongoose.Types.ObjectId[];
  type: "support" | "admin";
  lastMessageAt: Date;
  lastMessageContent: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participantIds: [{ type: Schema.Types.ObjectId }],
    type: { type: String, enum: ["support", "admin"], default: "support" },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageContent: { type: String, default: "" },
  },
  { collection: "conversations", timestamps: true }
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
