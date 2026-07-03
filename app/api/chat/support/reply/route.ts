import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supportReply, supportCloseSession } from "@/lib/services/chat.service";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== "support" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, content, action } = body;

    if (action === "close") {
      await supportCloseSession(sessionId);
      return NextResponse.json({ success: true });
    }

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const message = await supportReply(
      sessionId,
      content,
      session.user.id,
      session.user.name || "Support"
    );

    return NextResponse.json({ message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
