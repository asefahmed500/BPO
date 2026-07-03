"use client";

import { useState, useEffect } from "react";
import { getAllRequirements } from "@/lib/actions/requirement-actions";
import { getConversations } from "@/lib/actions/message-actions";
import Link from "next/link";

export default function SupportPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reqs, convs] = await Promise.all([
          getAllRequirements(),
          getConversations(),
        ]);
        setRequirements(reqs.filter((r: any) => r.status === "pending"));
        setConversations(convs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <p className="text-muted text-sm mb-8">Support ticket queue</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-display font-light text-ink mb-4">
            Pending Requirements ({loading ? "..." : requirements.length})
          </h2>
          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : requirements.length === 0 ? (
            <p className="text-sm text-muted">No pending requirements</p>
          ) : (
            <div className="space-y-2">
              {requirements.map((req: any) => (
                <Link
                  key={req._id}
                  href="/support"
                  className="block bg-white rounded-2xl border border-hairline p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-ink">{req.title}</span>
                    <span className="text-xs text-muted-soft">
                      {req.user?.name || "Unknown"}
                    </span>
                  </div>
                  <p className="text-xs text-muted line-clamp-1">{req.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-base font-display font-light text-ink mb-4">
            Active Conversations ({loading ? "..." : conversations.length})
          </h2>
          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted">No active conversations</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv: any) => (
                <Link
                  key={conv._id}
                  href={`/support/messages`}
                  className="block bg-white rounded-2xl border border-hairline p-4 hover:shadow-sm transition-shadow"
                >
                  <p className="text-sm text-ink">
                    Conversation with {conv.participants?.find((p: any) => p.role !== "support")?.name || "User"}
                  </p>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {conv.lastMessageContent || "No messages"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
