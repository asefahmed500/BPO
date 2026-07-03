"use server";

import { connectDB } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import mongoose from "mongoose";
import { eventBus } from "@/lib/events/emitter";
import { serializeArray } from "@/lib/utils/serialize";

const SendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, "Message is required"),
});

export async function getConversations() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const conversations = await Conversation.aggregate([
    { $match: { participantIds: new mongoose.Types.ObjectId(session.user.id) } },
    { $sort: { lastMessageAt: -1 } },
    {
      $lookup: {
        from: "user",
        localField: "participantIds",
        foreignField: "_id",
        as: "participants",
      },
    },
  ]);

  return serializeArray(
    conversations.map((c) => ({
      ...c,
      participants: (c.participants || []).map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        role: p.role,
      })),
    }))
  );
}

export async function getMessages(conversationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participantIds.some(
    (id: any) => id.toString() === session.user.id
  ))
    throw new Error("Unauthorized");

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  return serializeArray(messages.map((m) => m.toObject()));
}

export async function sendMessage(data: z.infer<typeof SendMessageSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = SendMessageSchema.parse(data);
  await connectDB();

  const conversation = await Conversation.findById(parsed.conversationId);
  if (!conversation || !conversation.participantIds.some(
    (id: any) => id.toString() === session.user.id
  ))
    throw new Error("Unauthorized");

  await Message.create({
    conversationId: parsed.conversationId,
    senderId: session.user.id,
    content: parsed.content,
    readAt: null,
  });

  await Conversation.updateOne(
    { _id: parsed.conversationId },
    {
      lastMessageAt: new Date(),
      lastMessageContent: parsed.content,
    }
  );

  const otherParticipants = conversation.participantIds
    .filter((id: any) => id.toString() !== session.user.id)
    .map((id: any) => id.toString());

  for (const recipientId of otherParticipants) {
    await eventBus.emit(
      "message.sent",
      {
        recipientId,
        senderName: session.user.name,
        content: parsed.content,
      },
      session.user.id
    );
  }

  return { success: true };
}

export async function startConversation(participantId: string, type: string = "support") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  const existing = await Conversation.findOne({
    participantIds: { $all: [session.user.id, participantId] },
    type,
  });

  if (existing) return { id: existing._id.toString() };

  const result = await Conversation.create({
    participantIds: [
      new mongoose.Types.ObjectId(session.user.id),
      new mongoose.Types.ObjectId(participantId),
    ],
    type,
    lastMessageAt: new Date(),
    lastMessageContent: "",
  });

  return { id: result._id.toString() };
}

export async function markAsRead(conversationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: session.user.id },
      readAt: null,
    },
    { readAt: new Date() }
  );

  return { success: true };
}
