"use client";

import { useState, useEffect, useRef, use } from "react";
import { useSession } from "@/lib/auth-client";
import {
  getMessages,
  sendMessage,
  markAsRead,
} from "@/lib/actions/message-actions";
import Link from "next/link";

export default function SupportConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const data = await getMessages(id);
      setMessages(data);
      await markAsRead(id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({ conversationId: id, content: content.trim() });
      setContent("");
      loadMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)]">
      <Link
        href="/support/messages"
        className="text-xs text-muted hover:text-ink transition-colors mb-4 inline-block"
      >
        &larr; Back to conversations
      </Link>

      <div className="flex-1 bg-white rounded-2xl border border-hairline flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted text-sm">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              No messages yet. Send one below.
            </div>
          ) : (
            messages.map((msg: any) => {
              const isMine = msg.senderId === session?.user?.id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? "bg-primary text-on-primary"
                        : "bg-canvas text-body"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? "text-on-dark-soft" : "text-muted-soft"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-hairline p-4 flex gap-3"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
