"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import Goal from "@/models/Goal";
import mongoose from "mongoose";
import { eventBus } from "@/lib/events/emitter";
import { serialize, serializeArray } from "@/lib/utils/serialize";

const CreateGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  category: z
    .enum(["sales", "performance", "learning", "personal", "custom"])
    .default("performance"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  targetValue: z.number().positive("Target must be positive"),
  currentValue: z.number().min(0).default(0),
  unit: z.string().default("units"),
  deadline: z.string().optional(),
  tags: z.array(z.string()).default([]),
  milestones: z
    .array(
      z.object({
        title: z.string(),
        targetValue: z.number(),
      })
    )
    .default([]),
});

const UpdateProgressSchema = z.object({
  goalId: z.string(),
  currentValue: z.number().min(0),
  note: z.string().optional(),
});

export async function getGoals() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const goals = await Goal.find({ userId: session.user.id }).sort({
    priority: 1,
    createdAt: -1,
  });

  return serializeArray(goals.map((g) => g.toObject()));
}

export async function getGoalStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const goals = await Goal.find({ userId: session.user.id });
  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const overdue = goals.filter(
    (g) => g.deadline && new Date(g.deadline) < new Date() && g.status === "active"
  );
  const avgProgress =
    active.length > 0
      ? Math.round(
          active.reduce((sum, g) => sum + g.progressPercent, 0) / active.length
        )
      : 0;

  return {
    total: goals.length,
    active: active.length,
    completed: completed.length,
    overdue: overdue.length,
    avgProgress,
  };
}

export async function createGoal(data: z.infer<typeof CreateGoalSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = CreateGoalSchema.parse(data);
  await connectDB();

  const progressPercent =
    parsed.targetValue > 0
      ? Math.min(100, Math.round((parsed.currentValue / parsed.targetValue) * 100))
      : 0;

  const milestones = parsed.milestones.map((m) => ({
    title: m.title,
    targetValue: m.targetValue,
    completed: parsed.currentValue >= m.targetValue,
    completedAt: parsed.currentValue >= m.targetValue ? new Date() : null,
  }));

  const status = progressPercent >= 100 ? "completed" : "active";

  const goal = await Goal.create({
    userId: new mongoose.Types.ObjectId(session.user.id),
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    priority: parsed.priority,
    targetValue: parsed.targetValue,
    currentValue: parsed.currentValue,
    unit: parsed.unit,
    status,
    progressPercent,
    deadline: parsed.deadline ? new Date(parsed.deadline) : null,
    tags: parsed.tags,
    milestones,
    progressNotes: [],
  });

  if (status === "completed") {
    await eventBus.emit(
      "goal.completed",
      { goalId: goal._id.toString(), title: parsed.title },
      session.user.id
    );
  }

  return { id: goal._id.toString() };
}

export async function updateGoalProgress(data: z.infer<typeof UpdateProgressSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = UpdateProgressSchema.parse(data);
  await connectDB();

  const goal = await Goal.findOne({
    _id: parsed.goalId,
    userId: session.user.id,
  });

  if (!goal) throw new Error("Goal not found");

  goal.currentValue = parsed.currentValue;
  goal.progressPercent = Math.min(
    100,
    Math.round((parsed.currentValue / goal.targetValue) * 100)
  );

  if (parsed.note) {
    goal.progressNotes.push({
      note: parsed.note,
      value: parsed.currentValue,
      createdAt: new Date(),
    });
  }

  goal.milestones = goal.milestones.map((m: any) => {
    if (!m.completed && parsed.currentValue >= m.targetValue) {
      return { ...m.toObject(), completed: true, completedAt: new Date() };
    }
    return m;
  });

  const wasNotCompleted = goal.status !== "completed";
  if (goal.progressPercent >= 100 && wasNotCompleted) {
    goal.status = "completed";
    await eventBus.emit(
      "goal.completed",
      { goalId: goal._id.toString(), title: goal.title },
      session.user.id
    );
  }

  await goal.save();
  return serialize(goal.toObject());
}

export async function addMilestone(goalId: string, title: string, targetValue: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  await Goal.updateOne(
    { _id: goalId, userId: session.user.id },
    { $push: { milestones: { title, targetValue, completed: false, completedAt: null } } }
  );

  return { success: true };
}

export async function toggleMilestone(goalId: string, milestoneIndex: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const goal = await Goal.findOne({ _id: goalId, userId: session.user.id });
  if (!goal) throw new Error("Goal not found");

  if (goal.milestones[milestoneIndex]) {
    const m = goal.milestones[milestoneIndex];
    m.completed = !m.completed;
    m.completedAt = m.completed ? new Date() : null;
    await goal.save();
  }

  return { success: true };
}

export async function updateGoalStatus(
  goalId: string,
  status: "active" | "completed" | "paused"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  await Goal.updateOne({ _id: goalId, userId: session.user.id }, { status });
  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  await Goal.deleteOne({ _id: goalId, userId: session.user.id });
  return { success: true };
}
