import { connectDB } from "@/lib/mongoose";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import { serialize } from "@/lib/utils/serialize";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await connectDB();
    const notif = await Notification.create({
      userId: new mongoose.Types.ObjectId(input.userId),
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link || "",
      read: false,
    });

    notifyLiveSubscribers(input.userId, notif.toObject());
    return serialize(notif.toObject());
  } catch (err) {
    console.error("[Notification] Failed to create:", err);
    return null;
  }
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  return Promise.all(inputs.map((i) => createNotification(i)));
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectDB();
  return Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    read: false,
  });
}

export async function getNotifications(
  userId: string,
  limit: number = 30
) {
  await connectDB();
  const notifs = await Notification.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return notifs.map((n) => ({
    ...n,
    _id: n._id.toString(),
    userId: n.userId.toString(),
  }));
}

export async function markNotificationRead(notificationId: string, userId: string) {
  await connectDB();
  await Notification.updateOne(
    { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
    { read: true }
  );
  return { success: true };
}

export async function markAllRead(userId: string) {
  await connectDB();
  await Notification.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), read: false },
    { read: true }
  );
  return { success: true };
}

// --- Live SSE subscribers ---
type Subscriber = (data: any) => void;
const subscribers: Map<string, Set<Subscriber>> = new Map();

export function subscribeToNotifications(userId: string, callback: Subscriber): () => void {
  if (!subscribers.has(userId)) {
    subscribers.set(userId, new Set());
  }
  subscribers.get(userId)!.add(callback);

  return () => {
    subscribers.get(userId)?.delete(callback);
    if (subscribers.get(userId)?.size === 0) {
      subscribers.delete(userId);
    }
  };
}

function notifyLiveSubscribers(userId: string, data: any) {
  const subs = subscribers.get(userId);
  if (subs) {
    subs.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("[Notification] SSE push error:", err);
      }
    });
  }
}
