import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { collection: "notifications", timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
