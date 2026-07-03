"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import Meeting from "@/models/Meeting";
import mongoose from "mongoose";
import { eventBus } from "@/lib/events/emitter";
import { serialize, serializeArray } from "@/lib/utils/serialize";

const CreateMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  type: z
    .enum(["one-on-one", "team", "client", "review", "standup"])
    .default("one-on-one"),
  scheduledAt: z.string().min(1, "Date/time is required"),
  duration: z.number().min(5).default(30),
  timezone: z.string().default("UTC"),
  location: z.string().default(""),
  meetingLink: z.string().default(""),
  recurring: z
    .enum(["none", "daily", "weekly", "biweekly", "monthly"])
    .default("none"),
  participantIds: z.array(z.string()).default([]),
  agendaItems: z
    .array(z.object({ title: z.string(), duration: z.number() }))
    .default([]),
});

export async function getMeetings() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const meetings = await Meeting.find({
    participantIds: session.user.id,
  }).sort({ scheduledAt: -1 });

  return serializeArray(meetings.map((m) => m.toObject()));
}

export async function getUpcomingMeetings(limit: number = 5) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const now = new Date();
  const meetings = await Meeting.find({
    participantIds: session.user.id,
    scheduledAt: { $gte: now },
    status: "scheduled",
  })
    .sort({ scheduledAt: 1 })
    .limit(limit);

  return serializeArray(meetings.map((m) => m.toObject()));
}

export async function getAllMeetings() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  const meetings = await Meeting.aggregate([
    { $sort: { scheduledAt: -1 } },
    {
      $lookup: {
        from: "user",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
  ]);

  return serializeArray(
    meetings.map((m) => ({
      ...m,
      creator: m.creator
        ? { id: m.creator._id.toString(), name: m.creator.name }
        : null,
    }))
  );
}

export async function getMeetingsByDateRange(
  startDate: string,
  endDate: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  const meetings = await Meeting.aggregate([
    {
      $match: {
        scheduledAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    { $sort: { scheduledAt: 1 } },
    {
      $lookup: {
        from: "user",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
  ]);

  return serializeArray(
    meetings.map((m) => ({
      ...m,
      creator: m.creator
        ? { id: m.creator._id.toString(), name: m.creator.name }
        : null,
    }))
  );
}

export async function getUserMeetingsByDateRange(
  startDate: string,
  endDate: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const meetings = await Meeting.find({
    participantIds: session.user.id,
    scheduledAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).sort({ scheduledAt: 1 });

  return serializeArray(meetings.map((m) => m.toObject()));
}

export async function getMeetingsCalendar(year: number, month: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const meetings = await Meeting.find({
    participantIds: session.user.id,
    scheduledAt: { $gte: start, $lte: end },
  }).sort({ scheduledAt: 1 });

  return serializeArray(meetings.map((m) => m.toObject()));
}

export async function createMeeting(data: z.infer<typeof CreateMeetingSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const parsed = CreateMeetingSchema.parse(data);
  await connectDB();

  const scheduledAt = new Date(parsed.scheduledAt);
  const endDate = new Date(scheduledAt.getTime() + parsed.duration * 60000);

  const allParticipants = [
    new mongoose.Types.ObjectId(session.user.id),
    ...parsed.participantIds.map((id) => new mongoose.Types.ObjectId(id)),
  ];

  const meeting = await Meeting.create({
    title: parsed.title,
    description: parsed.description,
    type: parsed.type,
    scheduledAt,
    endDate,
    duration: parsed.duration,
    timezone: parsed.timezone,
    location: parsed.location,
    meetingLink: parsed.meetingLink,
    recurring: parsed.recurring,
    recurringParentId: null,
    createdBy: new mongoose.Types.ObjectId(session.user.id),
    participantIds: allParticipants,
    status: "scheduled",
    agendaItems: parsed.agendaItems.map((a) => ({
      title: a.title,
      duration: a.duration,
      completed: false,
    })),
    minutes: "",
    actionItems: [],
    remindersSent: [],
  });

  // Create recurring instances
  if (parsed.recurring !== "none") {
    const recurringMeetings: any[] = [];
    const intervals: Record<string, number> = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
      monthly: 30,
    };
    const interval = intervals[parsed.recurring];

    for (let i = 1; i <= 12; i++) {
      const nextDate = new Date(scheduledAt.getTime() + interval * i * 86400000);
      recurringMeetings.push({
        ...meeting.toObject(),
        _id: new mongoose.Types.ObjectId(),
        scheduledAt: nextDate,
        endDate: new Date(nextDate.getTime() + parsed.duration * 60000),
        recurringParentId: meeting._id,
      });
    }

    if (recurringMeetings.length > 0) {
      await Meeting.insertMany(recurringMeetings);
    }
  }

  // Notify participants
  for (const participantId of parsed.participantIds) {
    await eventBus.emit(
      "meeting.scheduled",
      {
        meetingId: meeting._id.toString(),
        title: parsed.title,
        scheduledAt: parsed.scheduledAt,
        participantId,
      },
      session.user.id
    );
  }

  return { id: meeting._id.toString() };
}

export async function updateMeetingStatus(
  meetingId: string,
  status: "in-progress" | "completed" | "cancelled" | "no-show"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();

  const meeting = await Meeting.findById(meetingId).lean();
  await Meeting.updateOne({ _id: meetingId }, { status });

  if (status === "completed" || status === "cancelled") {
    for (const participantId of meeting?.participantIds || []) {
      if (participantId.toString() !== session.user.id) {
        await eventBus.emit(
          `meeting.${status}`,
          {
            meetingId,
            title: meeting?.title || "",
            participantId: participantId.toString(),
          },
          session.user.id
        );
      }
    }
  }

  return { success: true };
}

export async function addMeetingMinutes(meetingId: string, minutes: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const meeting = await Meeting.findById(meetingId).lean();
  if (!meeting) throw new Error("Meeting not found");

  const isParticipant = meeting.participantIds?.some(
    (p: any) => p.toString() === session.user.id
  );
  if (!isParticipant && session.user.role !== "admin")
    throw new Error("Unauthorized");

  await Meeting.updateOne({ _id: meetingId }, { minutes });
  return { success: true };
}

export async function addActionItem(
  meetingId: string,
  title: string,
  assigneeId: string | null,
  dueDate: string | null
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const meeting = await Meeting.findById(meetingId).lean();
  if (!meeting) throw new Error("Meeting not found");

  const isParticipant = meeting.participantIds?.some(
    (p: any) => p.toString() === session.user.id
  );
  if (!isParticipant && session.user.role !== "admin")
    throw new Error("Unauthorized");

  await Meeting.updateOne(
    { _id: meetingId },
    {
      $push: {
        actionItems: {
          title,
          assigneeId: assigneeId ? new mongoose.Types.ObjectId(assigneeId) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          completed: false,
        },
      },
    }
  );

  return { success: true };
}
