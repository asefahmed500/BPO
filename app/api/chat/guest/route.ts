import { NextRequest, NextResponse } from "next/server";
import {
  guestSend,
  guestGetMessages,
  guestGetSessions,
} from "@/lib/services/chat.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, content, visitorName } = body;

    if (!clientId || !content) {
      return NextResponse.json(
        { error: "clientId and content are required" },
        { status: 400 }
      );
    }

    const result = await guestSend(clientId, content, visitorName);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const sessionId = searchParams.get("sessionId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    if (sessionId) {
      const messages = await guestGetMessages(clientId, sessionId);
      return NextResponse.json({ messages });
    }

    const sessions = await guestGetSessions(clientId);
    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
