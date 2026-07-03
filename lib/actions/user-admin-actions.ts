"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import User from "@/models/User";
import { eventBus } from "@/lib/events/emitter";
import { serializeArray } from "@/lib/utils/serialize";

export async function getAllUsers() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  const users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();

  return serializeArray(
    users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role || "user",
      isBlocked: u.banned || false,
      department: u.department || "",
      jobTitle: u.jobTitle || "",
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
      emailVerified: u.emailVerified,
    }))
  );
}

export async function getAssignableUsers() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const users = await User.find(
    { banned: false },
    "_id name role"
  ).sort({ name: 1 }).lean();

  return serializeArray(
    users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      role: u.role || "user",
    }))
  );
}

export async function updateUserRole(userId: string, role: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  if (!["user", "support", "admin"].includes(role)) throw new Error("Invalid role");

  await connectDB();

  await User.updateOne({ _id: userId }, { role });

  await eventBus.emit(
    "user.role_changed",
    { userId, newRole: role },
    session.user.id
  );

  return { success: true };
}

export async function getUserCount() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();
  return await User.countDocuments();
}

export async function toggleUserBlock(userId: string, blocked: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  await User.updateOne({ _id: userId }, { banned: blocked });

  await eventBus.emit(
    blocked ? "user.blocked" : "user.unblocked",
    { userId },
    session.user.id
  );

  return { success: true };
}

export async function updateUserProfile(data: {
  phone?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  skills?: string[];
  timezone?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const update: any = {};
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.department !== undefined) update.department = data.department;
  if (data.jobTitle !== undefined) update.jobTitle = data.jobTitle;
  if (data.bio !== undefined) update.bio = data.bio;
  if (data.skills !== undefined) update.skills = data.skills;
  if (data.timezone !== undefined) update.timezone = data.timezone;

  await User.updateOne({ _id: session.user.id }, update);

  return { success: true };
}

export async function updatePreferences(data: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyDigest?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const update: any = {};
  if (data.emailNotifications !== undefined)
    update["preferences.emailNotifications"] = data.emailNotifications;
  if (data.pushNotifications !== undefined)
    update["preferences.pushNotifications"] = data.pushNotifications;
  if (data.weeklyDigest !== undefined)
    update["preferences.weeklyDigest"] = data.weeklyDigest;

  await User.updateOne({ _id: session.user.id }, update);

  return { success: true };
}
