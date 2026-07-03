"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/goals": "Goals",
  "/dashboard/requirements": "Requirements",
  "/dashboard/projects": "Projects",
  "/dashboard/meetings": "Meetings",
  "/dashboard/messages": "Messages",
  "/dashboard/chat": "AI Chat",
  "/dashboard/notifications": "Notifications",
  "/admin": "Admin Overview",
  "/admin/users": "User Management",
  "/admin/requirements": "All Requirements",
  "/admin/meetings": "Meetings",
  "/admin/live-chat": "Live Chat",
  "/admin/audit-log": "Audit Log",
  "/admin/settings": "Settings",
  "/support": "Support Dashboard",
  "/support/live-chat": "Live Chat",
  "/support/messages": "Support Messages",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userData = session.user as { role?: string; name?: string };
  const role = userData?.role || "user";
  const userName = session.user?.name || "User";

  const routeKey = Object.keys(pageTitles).find(
    (k) => pathname === k || pathname.startsWith(k + "/")
  );
  const title = routeKey ? pageTitles[routeKey] : "Dashboard";

  const isAdminRoute = pathname.startsWith("/admin");
  const isSupportRoute = pathname.startsWith("/support");

  if (isAdminRoute && role !== "admin") {
    router.replace("/dashboard");
    return null;
  }
  if (isSupportRoute && role !== "support" && role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="min-h-dvh flex bg-canvas">
      <AppSidebar role={role} userName={userName} />
      <div className="flex-1 flex flex-col min-h-dvh">
        <AppTopbar title={title} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
