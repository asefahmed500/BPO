import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

export async function logAudit(params: {
  actorId?: string;
  actorName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}) {
  try {
    await connectDB();
    await AuditLog.create({
      actorId: params.actorId
        ? new mongoose.Types.ObjectId(params.actorId)
        : null,
      actorName: params.actorName || "system",
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || "",
      details: params.details || {},
    });
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}

export async function getAuditLogs(limit: number = 50) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  const logs = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return logs.map((l) => ({
    ...l,
    _id: l._id.toString(),
    actorId: l.actorId?.toString() || "",
  }));
}
