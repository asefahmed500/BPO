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
  userId: z.string().optional(),
  category: z.string().default("general"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  color: z.string().default("#292524"),
  budget: z.number().min(0).default(0),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string()).default([]),
  teamMemberIds: z.array(z.string()).default([]),
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
  const projects = await Project.find(filter).sort({ priority: 1, createdAt: -1 });

  const projectsWithTasks = await Promise.all(
    projects.map(async (p) => {
      const tasks = await Task.find({ projectId: p._id.toString() }).sort({
        order: 1,
        createdAt: -1,
      });

      const taskObjects = tasks.map((t) => t.toObject());
      const doneTasks = taskObjects.filter((t) => t.status === "done").length;
      const progress =
        taskObjects.length > 0
          ? Math.round((doneTasks / taskObjects.length) * 100)
          : p.progress;

      if (progress !== p.progress) {
        await Project.updateOne({ _id: p._id }, { progress });
      }

      return {
        ...p.toObject(),
        tasks: taskObjects,
        taskCount: taskObjects.length,
        completedTasks: doneTasks,
        progress,
      };
    })
  );

  return serializeArray(projectsWithTasks);
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
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const parsed = CreateProjectSchema.parse(data);
  await connectDB();

  const project = await Project.create({
    name: parsed.name,
    description: parsed.description,
    userId: new mongoose.Types.ObjectId(parsed.userId || session.user.id),
    status: "planning",
    priority: parsed.priority,
    category: parsed.category,
    color: parsed.color,
    progress: 0,
    progressHistory: [{ percent: 0, note: "Project created", date: new Date() }],
    startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
    deadline: parsed.deadline ? new Date(parsed.deadline) : null,
    budget: parsed.budget,
    budgetSpent: 0,
    tags: parsed.tags,
    teamMemberIds: parsed.teamMemberIds.map((id) => new mongoose.Types.ObjectId(id)),
    attachments: [],
    metadata: {},
  });

  await eventBus.emit(
    "project.created",
    {
      projectId: project._id.toString(),
      name: parsed.name,
      userId: parsed.userId || session.user.id,
    },
    session.user.id
  );

  return { id: project._id.toString() };
}

export async function updateProjectStatus(
  projectId: string,
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled" | "archived"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  await Project.updateOne({ _id: projectId }, { status });

  if (status === "completed") {
    const project = await Project.findById(projectId).lean();
    if (project) {
      await Project.updateOne(
        { _id: projectId },
        {
          $push: {
            progressHistory: { percent: 100, note: "Project completed", date: new Date() },
          },
        }
      );
      await eventBus.emit(
        "project.completed",
        {
          projectId,
          name: project.name,
          userId: project.userId.toString(),
        },
        session.user.id
      );
    }
  }

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
