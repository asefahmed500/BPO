"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "How do I submit a requirement?",
  "What are my project options?",
  "How do I set up a goal?",
  "Can I schedule a meeting?",
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello${session?.user?.name ? ", " + session.user.name : ""}! I'm your AI assistant. I can help you navigate the dashboard, explain features, and answer questions. How can I help?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });
      const data = await response.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)]">
      <p className="text-muted text-sm mb-4">Ask me anything about the platform</p>

      <div className="flex-1 bg-white rounded-2xl border border-hairline flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-on-primary"
                    : "bg-canvas text-body"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-canvas rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-muted-soft rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-soft rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-soft rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-soft mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-hairline text-muted hover:text-ink hover:border-ink transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-hairline p-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
