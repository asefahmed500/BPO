import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supportGetSessions } from "@/lib/services/chat.service";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== "support" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await supportGetSessions();
  return NextResponse.json({ sessions });
}
