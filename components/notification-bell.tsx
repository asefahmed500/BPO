"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  fetchNotifications,
  fetchUnreadCount,
  readNotification,
  readAllNotifications,
} from "@/lib/actions/notification-actions";

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnread(count.count);
    } catch (err) {
      console.error("[Bell] Failed to load:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (session) loadNotifications();
  }, [session, loadNotifications]);

  // SSE for real-time
  useEffect(() => {
    if (!session) return;

    const es = new EventSource("/api/notifications/stream");

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "connected") {
          setUnread(payload.unreadCount);
        } else if (payload.type === "notification") {
          setNotifications((prev) => [payload.data, ...prev].slice(0, 30));
          setUnread((prev) => prev + 1);
        }
      } catch {}
    };

    return () => es.close();
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && notifications.length === 0 && !loading) {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    }
  };

  const handleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
    await readNotification(id);
  };

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await readAllNotifications();
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-canvas transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-body"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#ef4444] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white border border-hairline rounded-2xl shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
            <h3 className="text-sm font-medium text-ink">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (!notif.read) handleRead(notif._id);
                    if (notif.link) {
                      window.location.href = notif.link;
                    }
                  }}
                  className={`px-4 py-3 border-b border-hairline last:border-0 cursor-pointer hover:bg-canvas transition-colors ${
                    !notif.read ? "bg-[#f0fdf4]" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-body mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-hairline">
            <Link
              href="/dashboard/notifications"
              className="block text-center text-xs text-muted hover:text-ink transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
