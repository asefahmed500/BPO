"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import Requirement from "@/models/Requirement";
import mongoose from "mongoose";
import { eventBus } from "@/lib/events/emitter";
import { serialize, serializeArray } from "@/lib/utils/serialize";

const CreateRequirementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z
    .enum(["general", "software", "hardware", "services", "consulting", "support", "other"])
    .default("general"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  budget: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  desiredStartDate: z.string().optional(),
  desiredEndDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const AdminReviewSchema = z.object({
  requirementId: z.string(),
  status: z.enum(["reviewing", "approved", "rejected", "in-progress", "completed"]),
  adminNotes: z.string().optional(),
  linkedProjectId: z.string().optional(),
});

export async function getRequirements() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const requirements = await Requirement.find({
    userId: session.user.id,
  }).sort({ priority: 1, createdAt: -1 });

  return serializeArray(requirements.map((r) => r.toObject()));
}

export async function getAllRequirements() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== "admin" && session.user.role !== "support"))
    throw new Error("Unauthorized");

  await connectDB();

  const requirements = await Requirement.aggregate([
    {
      $lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $sort: { priority: 1, createdAt: -1 } },
  ]);

  return serializeArray(
    requirements.map((r) => ({
      ...r,
      user: r.user
        ? { id: r.user._id.toString(), name: r.user.name, email: r.user.email }
        : null,
    }))
  );
}

export async function getRequirement(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const requirement = await Requirement.findById(id);
  if (!requirement) throw new Error("Requirement not found");
  if (requirement.userId.toString() !== session.user.id && session.user.role !== "admin")
    throw new Error("Unauthorized");

  return serialize(requirement.toObject());
}

export async function createRequirement(data: z.infer<typeof CreateRequirementSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = CreateRequirementSchema.parse(data);
  await connectDB();

  const requirement = await Requirement.create({
    userId: new mongoose.Types.ObjectId(session.user.id),
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    priority: parsed.priority,
    status: "pending",
    budget: parsed.budget,
    currency: parsed.currency,
    desiredStartDate: parsed.desiredStartDate ? new Date(parsed.desiredStartDate) : null,
    desiredEndDate: parsed.desiredEndDate ? new Date(parsed.desiredEndDate) : null,
    tags: parsed.tags,
    adminNotes: "",
    linkedProjectId: null,
    history: [
      {
        from: "",
        to: "pending",
        changedBy: session.user.name,
        note: "Requirement submitted",
        changedAt: new Date(),
      },
    ],
  });

  await eventBus.emit(
    "requirement.submitted",
    {
      requirementId: requirement._id.toString(),
      title: parsed.title,
      userId: session.user.id,
      userName: session.user.name,
      priority: parsed.priority,
    },
    session.user.id
  );

  return { id: requirement._id.toString() };
}

export async function reviewRequirement(data: z.infer<typeof AdminReviewSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const parsed = AdminReviewSchema.parse(data);
  await connectDB();

  const req = await Requirement.findById(parsed.requirementId);
  if (!req) throw new Error("Requirement not found");

  const oldStatus = req.status;
  req.status = parsed.status;
  if (parsed.adminNotes) req.adminNotes = parsed.adminNotes;
  if (parsed.linkedProjectId) {
    req.linkedProjectId = new mongoose.Types.ObjectId(parsed.linkedProjectId);
  }
  req.history.push({
    from: oldStatus,
    to: parsed.status,
    changedBy: session.user.name,
    note: parsed.adminNotes || "",
    changedAt: new Date(),
  });
  await req.save();

  const eventType =
    parsed.status === "approved"
      ? "requirement.approved"
      : parsed.status === "rejected"
      ? "requirement.rejected"
      : null;

  if (eventType) {
    await eventBus.emit(
      eventType,
      {
        requirementId: parsed.requirementId,
        title: req.title,
        userId: req.userId.toString(),
        adminNotes: parsed.adminNotes || "",
      },
      session.user.id
    );
  }

  return { success: true };
}
