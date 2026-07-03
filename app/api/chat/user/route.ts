import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { userSend, userGetMessages, userGetSession } from "@/lib/services/chat.service";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const result = await userSend(
      session.user.id,
      session.user.name || "User",
      content.trim()
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "session") {
    const chatSession = await userGetSession(session.user.id);
    return NextResponse.json({ session: chatSession });
  }

  const sessionId = searchParams.get("sessionId") || undefined;
  const messages = await userGetMessages(session.user.id, sessionId);
  return NextResponse.json({ messages });
}
