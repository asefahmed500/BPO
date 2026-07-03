"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchNotifications,
  readAllNotifications,
  readNotification,
} from "@/lib/actions/notification-actions";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    await readNotification(id);
  };

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await readAllNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeColors: Record<string, string> = {
    "requirement.approved": "#22c55e",
    "requirement.rejected": "#ef4444",
    "requirement.submitted": "#0ea5e9",
    "meeting.scheduled": "#8b5cf6",
    "meeting.completed": "#22c55e",
    "meeting.cancelled": "#ef4444",
    "message.sent": "#0ea5e9",
    "project.created": "#8b5cf6",
    "project.completed": "#22c55e",
    "user.role_changed": "#f59e0b",
    "user.blocked": "#ef4444",
    "user.unblocked": "#22c55e",
    "task.assigned": "#0ea5e9",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-light text-ink">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="text-sm text-muted hover:text-ink transition-colors px-3 py-1.5 rounded-lg border border-hairline hover:bg-canvas"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 bg-white border border-hairline rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-hairline rounded-2xl">
          <p className="text-muted text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.read && handleRead(notif._id)}
              className={`flex items-start gap-3 px-5 py-4 bg-white border border-hairline rounded-2xl cursor-pointer hover:border-ink/30 transition-colors ${
                !notif.read ? "ring-1 ring-[#22c55e]/20" : ""
              }`}
            >
              <div
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: typeColors[notif.type] || "#777169" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{notif.title}</p>
                  {!notif.read && (
                    <span className="text-[10px] font-semibold text-[#22c55e] uppercase tracking-wide">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-body mt-0.5">{notif.message}</p>
                <p className="text-xs text-muted mt-1">{formatTime(notif.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
