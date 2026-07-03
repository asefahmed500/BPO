"use client";

import { NotificationBell } from "@/components/notification-bell";

export function AppTopbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-hairline px-8 py-3 flex items-center justify-between">
      <h1 className="text-lg font-display font-light text-ink">{title}</h1>
      <NotificationBell />
    </header>
  );
}
