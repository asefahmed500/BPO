"use client";

import { useState, useEffect } from "react";
import { getConversations, startConversation } from "@/lib/actions/message-actions";
import Link from "next/link";

export default function SupportMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setConversations(await getConversations());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <p className="text-muted text-sm mb-8">Messages from users</p>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm mb-4">No conversations yet</p>
          <p className="text-xs text-muted-soft">
            Conversations will appear here when users message you
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const other = conv.participants?.find(
              (p: any) => p.role !== "support" && p.role !== "admin"
            );
            return (
              <Link
                key={conv._id}
                href={`/support/messages/${conv._id}`}
                className="block bg-white rounded-2xl border border-hairline p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                    {(other?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium truncate">
                      {other?.name || "User"}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {conv.lastMessageContent || "No messages yet"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-soft shrink-0">
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
