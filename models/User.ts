import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "admin" | "user" | "support";
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  phone: string;
  department: string;
  jobTitle: string;
  bio: string;
  skills: string[];
  timezone: string;
  avatarColor: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
  };
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: { type: String, enum: ["admin", "user", "support"], default: "user" },
    banned: { type: Boolean, default: false },
    banReason: { type: String },
    banExpires: { type: Date },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    timezone: { type: String, default: "UTC" },
    avatarColor: { type: String, default: "#292524" },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
    lastActiveAt: { type: Date, default: null },
  },
  {
    collection: "user",
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
