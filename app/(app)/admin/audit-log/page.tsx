"use client";

import { useState, useEffect, useCallback } from "react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/audit-log?limit=100");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-display font-light text-ink mb-6">
        Audit Log
      </h2>

      {loading ? (
        <div className="h-96 bg-white border border-hairline rounded-2xl animate-pulse" />
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-hairline rounded-2xl">
          <p className="text-muted text-sm">No audit logs yet</p>
        </div>
      ) : (
        <div className="bg-white border border-hairline rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-canvas">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                  Actor
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log._id}
                  className={`border-b border-hairline last:border-0 hover:bg-canvas transition-colors ${
                    i % 2 === 1 ? "bg-canvas/50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {formatTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">
                    {log.actorName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-canvas text-ink border border-hairline">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-body">
                    {log.resource}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted max-w-xs truncate">
                    {log.details && Object.keys(log.details).length > 0
                      ? JSON.stringify(log.details)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
