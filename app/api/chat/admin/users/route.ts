import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPlatformUsers } from "@/lib/services/chat.service";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== "admin" && session.user.role !== "support")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getPlatformUsers();
  return NextResponse.json({ users });
}
