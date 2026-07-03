"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { PanelRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const userNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Goals", href: "/dashboard/goals", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { label: "Requirements", href: "/dashboard/requirements", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Projects", href: "/dashboard/projects", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { label: "Meetings", href: "/dashboard/meetings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Messages", href: "/dashboard/messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "Live Chat", href: "/dashboard/live-chat", icon: "M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-2.927-.493L4 18l1.493-3.073A8.841 8.841 0 015 10c0-3.866 3.582-7 8-7s5 3.134 5 7z" },
  { label: "AI Chat", href: "/dashboard/chat", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
];

const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
  { label: "Requirements", href: "/admin/requirements", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Meetings", href: "/admin/meetings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Live Chat", href: "/admin/live-chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
  { label: "Audit Log", href: "/admin/audit-log", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

const supportNav: NavItem[] = [
  { label: "Overview", href: "/support", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Live Chat", href: "/support/live-chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "Messages", href: "/support/messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
];

function SvgIcon({ path, collapsed }: { path: string; collapsed?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${collapsed ? "mx-auto" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function AppSidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === "admin" ? adminNav : role === "support" ? supportNav : userNav;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (collapsed) {
    return (
      <aside className="w-16 shrink-0 min-h-dvh bg-white border-r border-hairline flex flex-col">
        <button
          onClick={() => setCollapsed(false)}
          className="px-3 py-5 border-b border-hairline flex justify-center hover:bg-canvas transition-colors"
        >
          <PanelRight className="w-4 h-4 text-ink" />
        </button>
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-canvas text-ink"
                    : "text-body hover:bg-canvas hover:text-ink"
                }`}
              >
                <SvgIcon path={item.icon} collapsed />
              </Link>
            );
          })}
        </nav>
        <div className="px-2 py-4 border-t border-hairline">
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="w-full flex items-center justify-center py-2 text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 min-h-dvh bg-white border-r border-hairline flex flex-col">
      <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
        <Link href="/" className="text-xl font-display font-light text-ink">
          Northbridge
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 text-muted hover:text-ink hover:bg-canvas transition-colors"
          title="Collapse sidebar"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-canvas text-ink font-medium"
                  : "text-body hover:bg-canvas hover:text-ink"
              }`}
            >
              <SvgIcon path={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-hairline">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink font-medium truncate">{userName}</p>
            <p className="text-xs text-muted capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full mt-1 px-3 py-2 text-sm text-muted hover:text-ink hover:bg-canvas transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
