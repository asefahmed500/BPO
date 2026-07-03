"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";

export function UserChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/user");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const es = new EventSource("/api/chat/user/stream");
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "support_reply" && payload.message) {
          setMessages((prev) => {
            const exists = prev.some(
              (m) => m._id === payload.message._id ||
              (m.content === payload.message.content && m.senderType === "support")
            );
            if (exists) return prev;
            return [...prev, payload.message];
          });
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        _id: `temp_${Date.now()}`,
        senderType: "user",
        senderName: session?.user?.name || "You",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)] bg-white border border-hairline">
      <div className="px-4 py-3 border-b border-hairline shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <h2 className="text-sm font-medium text-ink">Messages with Admin</h2>
        </div>
        <p className="text-xs text-muted mt-0.5">
          Send a message and our team will respond
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-sm text-muted">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted mb-1">No messages yet</p>
            <p className="text-xs text-muted">
              Send a message below to start a conversation with our team
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderType === "user";
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 text-sm ${
                    isMe
                      ? "bg-[#292524] text-white"
                      : msg.senderType === "ai"
                      ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                      : "bg-canvas text-ink border border-hairline"
                  }`}
                >
                  {!isMe && msg.senderType !== "ai" && (
                    <p className="text-[10px] font-medium mb-0.5 text-muted">
                      {msg.senderName || "Support"}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-white/50" : "text-muted"
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
        className="p-4 border-t border-hairline flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-[#292524] text-white text-sm font-medium hover:bg-[#0c0a09] transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
