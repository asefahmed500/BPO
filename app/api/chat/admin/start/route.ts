import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminStartWithUser } from "@/lib/services/chat.service";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== "admin" && session.user.role !== "support")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetUserId, content } = body;

    if (!targetUserId || !content) {
      return NextResponse.json({ error: "targetUserId and content are required" }, { status: 400 });
    }

    const result = await adminStartWithUser(
      targetUserId,
      session.user.id,
      session.user.name || "Admin",
      content
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
