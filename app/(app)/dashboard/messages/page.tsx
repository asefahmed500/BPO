"use client";

import { useState, useEffect } from "react";
import { getConversations } from "@/lib/actions/message-actions";
import Link from "next/link";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const otherParticipant = (participants: any[], myId?: string) => {
    return participants?.find((p: any) => p.id !== myId);
  };

  return (
    <div>
      <p className="text-muted text-sm mb-8">Your conversations</p>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm mb-4">No conversations yet</p>
          <Link
            href="/dashboard/chat"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium inline-block"
          >
            Ask AI Chat
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const other = otherParticipant(conv.participants);
            return (
              <Link
                key={conv._id}
                href={`/dashboard/messages/${conv._id}`}
                className="block bg-white rounded-2xl border border-hairline p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                    {(other?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-ink font-medium truncate">
                        {other?.name || "Unknown"}
                      </p>
                      <span className="text-xs text-muted-soft shrink-0">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {conv.lastMessageContent || "No messages yet"}
                    </p>
                    <span className="text-[10px] text-muted-soft capitalize">
                      {conv.type} conversation
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
