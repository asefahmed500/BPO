"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import Project from "@/models/Project";
import Task from "@/models/Task";
import mongoose from "mongoose";
import { eventBus } from "@/lib/events/emitter";
import { serialize, serializeArray } from "@/lib/utils/serialize";

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  category: z.string().default("general"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  budget: z.number().min(0).default(0),
  deadline: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const UpdateProjectSchema = CreateProjectSchema.extend({
  projectId: z.string(),
});

const ReviewProjectSchema = z.object({
  projectId: z.string(),
  status: z.enum(["under-review", "approved", "needs-revision", "rejected", "active"]),
  feedback: z.string().default(""),
  quotedCost: z.number().min(0).default(0),
  quotedCostCurrency: z.string().default("USD"),
});

const CreateTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  taskType: z
    .enum(["task", "bug", "feature", "improvement", "research"])
    .default("task"),
  estimatedHours: z.number().min(0).default(0),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  assigneeId: z.string().optional(),
});

export async function getProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const filter =
    session.user.role === "admin" ? {} : { userId: session.user.id };
  const projects = await Project.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ]);

  return serializeArray(
    projects.map((p) => ({
      ...p,
      user: p.user
        ? { id: p.user._id.toString(), name: p.user.name, email: p.user.email }
        : null,
    }))
  );
}

export async function getProject(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");
  if (project.userId.toString() !== session.user.id && session.user.role !== "admin")
    throw new Error("Unauthorized");

  const tasks = await Task.find({ projectId: id }).sort({ order: 1, createdAt: -1 });

  return serialize({
    ...project.toObject(),
    tasks: tasks.map((t) => t.toObject()),
  });
}

export async function createProject(data: z.infer<typeof CreateProjectSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = CreateProjectSchema.parse(data);
  await connectDB();

  const project = await Project.create({
    name: parsed.name,
    description: parsed.description,
    userId: new mongoose.Types.ObjectId(session.user.id),
    status: "submitted",
    priority: parsed.priority,
    category: parsed.category,
    color: "#292524",
    progress: 0,
    progressHistory: [{ percent: 0, note: "Project submitted", date: new Date() }],
    startDate: new Date(),
    deadline: parsed.deadline ? new Date(parsed.deadline) : null,
    budget: parsed.budget,
    budgetSpent: 0,
    feedback: "",
    quotedCost: 0,
    quotedCostCurrency: "USD",
    comments: [],
    tags: parsed.tags,
    teamMemberIds: [new mongoose.Types.ObjectId(session.user.id)],
    attachments: [],
    metadata: {},
  });

  if (session.user.role !== "admin") {
    await eventBus.emit(
      "project.submitted",
      {
        projectId: project._id.toString(),
        name: parsed.name,
        userId: session.user.id,
        userName: session.user.name,
      },
      session.user.id
    );
  }

  return { id: project._id.toString() };
}

export async function updateProject(data: z.infer<typeof UpdateProjectSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = UpdateProjectSchema.parse(data);
  await connectDB();

  const project = await Project.findById(parsed.projectId);
  if (!project) throw new Error("Project not found");

  if (session.user.role !== "admin" && project.userId.toString() !== session.user.id) {
    throw new Error("Unauthorized");
  }

  project.name = parsed.name;
  project.description = parsed.description;
  project.category = parsed.category;
  project.priority = parsed.priority;
  project.budget = parsed.budget;
  project.deadline = parsed.deadline ? new Date(parsed.deadline) : null;
  project.tags = parsed.tags;

  if (project.status === "needs-revision" || project.status === "rejected") {
    project.status = "submitted";
  }

  await project.save();

  return { success: true };
}

export async function reviewProject(data: z.infer<typeof ReviewProjectSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const parsed = ReviewProjectSchema.parse(data);
  await connectDB();

  const project = await Project.findById(parsed.projectId);
  if (!project) throw new Error("Project not found");

  const oldStatus = project.status;
  project.status = parsed.status;
  if (parsed.feedback) project.feedback = parsed.feedback;
  if (parsed.quotedCost > 0) {
    project.quotedCost = parsed.quotedCost;
    project.quotedCostCurrency = parsed.quotedCostCurrency;
  }

  await project.save();

  const eventType =
    parsed.status === "approved"
      ? "project.approved"
      : parsed.status === "rejected"
      ? "project.rejected"
      : "project.feedback";

  await eventBus.emit(
    eventType,
    {
      projectId: parsed.projectId,
      name: project.name,
      userId: project.userId.toString(),
      feedback: parsed.feedback,
      quotedCost: parsed.quotedCost,
    },
    session.user.id
  );

  return { success: true };
}

export async function addProjectComment(projectId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  if (session.user.role !== "admin" && project.userId.toString() !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await Project.updateOne(
    { _id: projectId },
    {
      $push: {
        comments: {
          authorId: new mongoose.Types.ObjectId(session.user.id),
          authorName: session.user.name,
          authorRole: session.user.role || "user",
          content,
          createdAt: new Date(),
        },
      },
    }
  );

  return { success: true };
}

export async function createTask(data: z.infer<typeof CreateTaskSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = CreateTaskSchema.parse(data);
  await connectDB();

  const task = await Task.create({
    projectId: parsed.projectId,
    title: parsed.title,
    description: parsed.description,
    status: "todo",
    priority: parsed.priority,
    taskType: parsed.taskType,
    reporterId: new mongoose.Types.ObjectId(session.user.id),
    assigneeId: parsed.assigneeId
      ? new mongoose.Types.ObjectId(parsed.assigneeId)
      : null,
    estimatedHours: parsed.estimatedHours,
    loggedHours: 0,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    tags: parsed.tags,
    subtasks: [],
    comments: [],
    order: 0,
  });

  if (parsed.assigneeId && parsed.assigneeId !== session.user.id) {
    await eventBus.emit(
      "task.assigned",
      {
        taskId: task._id.toString(),
        title: parsed.title,
        assigneeId: parsed.assigneeId,
      },
      session.user.id
    );
  }

  return { id: task._id.toString() };
}

export async function updateTaskStatus(
  taskId: string,
  status: "backlog" | "todo" | "in-progress" | "review" | "done" | "blocked"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const task = await Task.findById(taskId).lean();
  if (!task) throw new Error("Task not found");

  if (session.user.role !== "admin") {
    const project = await Project.findById(task.projectId).lean();
    if (!project || project.userId.toString() !== session.user.id)
      throw new Error("Unauthorized");
  }

  const update: any = { status };
  if (status === "done") {
    update.completedAt = new Date();
  }

  await Task.updateOne({ _id: taskId }, update);
  return { success: true };
}

export async function addTaskComment(taskId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const task = await Task.findById(taskId).lean();
  if (!task) throw new Error("Task not found");

  if (session.user.role !== "admin") {
    const project = await Project.findById(task.projectId).lean();
    if (!project || project.userId.toString() !== session.user.id)
      throw new Error("Unauthorized");
  }

  await Task.updateOne(
    { _id: taskId },
    {
      $push: {
        comments: {
          authorId: new mongoose.Types.ObjectId(session.user.id),
          authorName: session.user.name,
          content,
          createdAt: new Date(),
        },
      },
    }
  );

  return { success: true };
}

export async function logTaskHours(taskId: string, hours: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const task = await Task.findById(taskId).lean();
  if (!task) throw new Error("Task not found");

  if (session.user.role !== "admin") {
    const project = await Project.findById(task.projectId).lean();
    if (!project || project.userId.toString() !== session.user.id)
      throw new Error("Unauthorized");
  }

  await Task.updateOne({ _id: taskId }, { $inc: { loggedHours: hours } });
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const task = await Task.findById(taskId).lean();
  if (!task) throw new Error("Task not found");

  if (session.user.role !== "admin") {
    const project = await Project.findById(task.projectId).lean();
    if (!project || project.userId.toString() !== session.user.id)
      throw new Error("Unauthorized");
  }

  await Task.deleteOne({ _id: taskId });
  return { success: true };
}
