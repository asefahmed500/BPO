import { connectDB } from "@/lib/mongoose";
import ChatSession from "@/models/ChatSession";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import mongoose from "mongoose";
import { serialize, serializeArray } from "@/lib/utils/serialize";

// ──────────────────────────────────────────────
// Guest API (no auth required)
// ──────────────────────────────────────────────

export async function guestSend(
  clientId: string,
  content: string,
  visitorName?: string
) {
  await connectDB();

  let session = await ChatSession.findOne({ clientId, status: { $ne: "closed" } });

  if (!session) {
    session = await ChatSession.create({
      clientId,
      sessionType: "guest",
      visitorName: visitorName || "Guest",
      visitorEmail: "",
      status: "waiting",
      assignedTo: null,
      lastMessageAt: new Date(),
      lastMessageContent: content,
      unreadForSupport: 1,
      unreadForGuest: 0,
    });
  } else {
    session.lastMessageAt = new Date();
    session.lastMessageContent = content;
    session.unreadForSupport += 1;
    if (visitorName) session.visitorName = visitorName;
    await session.save();
  }

  const message = await ChatMessage.create({
    sessionId: session._id,
    senderType: "guest",
    senderId: clientId,
    senderName: session.visitorName,
    content,
  });

  notifySupportSubscribers({
    type: "new_message",
    sessionId: session._id.toString(),
    message: serialize(message.toObject()),
    session: serialize(session.toObject()),
  });

  return {
    sessionId: session._id.toString(),
    message: serialize(message.toObject()),
  };
}

export async function guestGetMessages(clientId: string, sessionId: string) {
  await connectDB();

  const session = await ChatSession.findOne({ clientId, _id: sessionId });
  if (!session) throw new Error("Session not found");

  await ChatSession.updateOne({ _id: sessionId }, { unreadForGuest: 0 });

  const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
  return serializeArray(messages.map((m) => m.toObject()));
}

export async function guestGetSessions(clientId: string) {
  await connectDB();

  const sessions = await ChatSession.find({
    clientId,
    status: { $ne: "closed" },
  }).sort({ lastMessageAt: -1 });

  return serializeArray(sessions.map((s) => s.toObject()));
}

// ──────────────────────────────────────────────
// Authenticated User API (user ↔ admin/support)
// ──────────────────────────────────────────────

export async function userSend(
  userId: string,
  userName: string,
  content: string
) {
  await connectDB();

  let session = await ChatSession.findOne({
    sessionType: "user",
    userId: new mongoose.Types.ObjectId(userId),
    status: { $ne: "closed" },
  });

  if (!session) {
    const user = await User.findById(userId);
    session = await ChatSession.create({
      clientId: `user_${userId}`,
      sessionType: "user",
      userId: new mongoose.Types.ObjectId(userId),
      userName: userName,
      userEmail: user?.email || "",
      userRole: user?.role || "user",
      visitorName: userName,
      visitorEmail: user?.email || "",
      status: "waiting",
      assignedTo: null,
      lastMessageAt: new Date(),
      lastMessageContent: content,
      unreadForSupport: 1,
      unreadForGuest: 0,
      unreadForUser: 0,
    });
  } else {
    session.lastMessageAt = new Date();
    session.lastMessageContent = content;
    session.unreadForSupport += 1;
    await session.save();
  }

  const message = await ChatMessage.create({
    sessionId: session._id,
    senderType: "user",
    senderId: userId,
    senderName: userName,
    content,
  });

  notifySupportSubscribers({
    type: "new_message",
    sessionId: session._id.toString(),
    message: serialize(message.toObject()),
    session: serialize(session.toObject()),
  });

  return {
    sessionId: session._id.toString(),
    message: serialize(message.toObject()),
  };
}

export async function userGetMessages(userId: string, sessionId?: string) {
  await connectDB();

  let session;
  if (sessionId) {
    session = await ChatSession.findOne({
      _id: sessionId,
      sessionType: "user",
      userId: new mongoose.Types.ObjectId(userId),
    });
  } else {
    session = await ChatSession.findOne({
      sessionType: "user",
      userId: new mongoose.Types.ObjectId(userId),
      status: { $ne: "closed" },
    });
  }

  if (!session) return [];

  await ChatSession.updateOne(
    { _id: session._id },
    { unreadForUser: 0 }
  );

  const messages = await ChatMessage.find({ sessionId: session._id }).sort({
    createdAt: 1,
  });
  return serializeArray(messages.map((m) => m.toObject()));
}

export async function userGetSession(userId: string) {
  await connectDB();

  const session = await ChatSession.findOne({
    sessionType: "user",
    userId: new mongoose.Types.ObjectId(userId),
    status: { $ne: "closed" },
  });

  return session ? serialize(session.toObject()) : null;
}

// ──────────────────────────────────────────────
// Admin: start chat with a specific platform user
// ──────────────────────────────────────────────

export async function adminStartWithUser(
  targetUserId: string,
  agentId: string,
  agentName: string,
  content: string
) {
  await connectDB();

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new Error("User not found");

  let session = await ChatSession.findOne({
    sessionType: "user",
    userId: new mongoose.Types.ObjectId(targetUserId),
    status: { $ne: "closed" },
  });

  if (!session) {
    session = await ChatSession.create({
      clientId: `user_${targetUserId}`,
      sessionType: "user",
      userId: new mongoose.Types.ObjectId(targetUserId),
      userName: targetUser.name,
      userEmail: targetUser.email,
      userRole: targetUser.role,
      visitorName: targetUser.name,
      visitorEmail: targetUser.email,
      status: "active",
      assignedTo: new mongoose.Types.ObjectId(agentId),
      lastMessageAt: new Date(),
      lastMessageContent: content,
      unreadForSupport: 0,
      unreadForGuest: 0,
      unreadForUser: 1,
    });
  } else {
    session.status = "active";
    if (!session.assignedTo) {
      session.assignedTo = new mongoose.Types.ObjectId(agentId);
    }
    session.lastMessageAt = new Date();
    session.lastMessageContent = content;
    session.unreadForUser += 1;
    await session.save();
  }

  const message = await ChatMessage.create({
    sessionId: session._id,
    senderType: "support",
    senderId: agentId,
    senderName: agentName,
    content,
  });

  notifySupportSubscribers({
    type: "support_reply",
    sessionId: session._id.toString(),
    userId: session.userId?.toString() || null,
    message: serialize(message.toObject()),
  });

  return serialize(message.toObject());
}

export async function getPlatformUsers() {
  await connectDB();

  const users = await User.find({
    role: { $in: ["user", "support"] },
    isActive: { $ne: false },
  })
    .select("name email role")
    .sort({ name: 1 })
    .limit(200);

  return serializeArray(users.map((u) => u.toObject()));
}

// ──────────────────────────────────────────────
// Support/Admin shared API (auth required)
// ──────────────────────────────────────────────

export async function supportGetSessions() {
  await connectDB();

  const sessions = await ChatSession.find({
    status: { $ne: "closed" },
  }).sort({ lastMessageAt: -1 });

  return serializeArray(sessions.map((s) => s.toObject()));
}

export async function supportGetMessages(sessionId: string) {
  await connectDB();

  const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
  return serializeArray(messages.map((m) => m.toObject()));
}

export async function supportReply(
  sessionId: string,
  content: string,
  agentId: string,
  agentName: string
) {
  await connectDB();

  const session = await ChatSession.findById(sessionId);
  if (!session) throw new Error("Session not found");

  session.status = "active";
  if (!session.assignedTo) {
    session.assignedTo = new mongoose.Types.ObjectId(agentId);
  }
  session.lastMessageAt = new Date();
  session.lastMessageContent = content;

  if (session.sessionType === "user") {
    session.unreadForUser += 1;
  } else {
    session.unreadForGuest += 1;
  }
  await session.save();

  const message = await ChatMessage.create({
    sessionId,
    senderType: "support",
    senderId: agentId,
    senderName: agentName,
    content,
  });

  notifySupportSubscribers({
    type: "support_reply",
    sessionId,
    message: serialize(message.toObject()),
  });

  return serialize(message.toObject());
}

export async function supportCloseSession(sessionId: string) {
  await connectDB();
  await ChatSession.updateOne({ _id: sessionId }, { status: "closed" });
  return { success: true };
}

// ──────────────────────────────────────────────
// SSE subscriber system
// ──────────────────────────────────────────────

type SupportSubscriber = (data: any) => void;
const supportSubscribers: Set<SupportSubscriber> = new Set();

export function subscribeToSupportChat(callback: SupportSubscriber): () => void {
  supportSubscribers.add(callback);
  return () => supportSubscribers.delete(callback);
}

function notifySupportSubscribers(data: any) {
  supportSubscribers.forEach((cb) => {
    try {
      cb(data);
    } catch (err) {
      console.error("[ChatService] SSE push error:", err);
    }
  });
}
