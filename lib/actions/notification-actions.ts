"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
} from "@/lib/services/notification.service";

export async function fetchNotifications() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return getNotifications(session.user.id, 30);
}

export async function fetchUnreadCount() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return { count: await getUnreadCount(session.user.id) };
}

export async function readNotification(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return markNotificationRead(notificationId, session.user.id);
}

export async function readAllNotifications() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return markAllRead(session.user.id);
}
