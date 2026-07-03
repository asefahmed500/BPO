import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { collection: "messages", timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
