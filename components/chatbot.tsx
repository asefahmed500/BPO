"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function generateClientId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("nb_client_id");
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("nb_client_id", id);
  }
  return id;
}

const QUICK_REPLIES = [
  "What services do you offer?",
  "Pricing information",
  "Talk to a human agent",
];

const KB: Record<string, string> = {
  services:
    "We offer voice support, live chat, back-office processing, IT helpdesk, and digital CX across 9 delivery centers.",
  pricing:
    "Our pricing is customized based on volume and complexity. A human agent can provide a detailed quote.",
  hours:
    "Our support team operates 24/7 across global delivery centers.",
  contact:
    "You can reach us via the contact form, or chat live with a support agent right here!",
  human:
    "I'm connecting you with a support agent. Please type your message below and they'll respond shortly.",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "bot" | "guest" | "support"; content: string; name?: string }[]
  >([
    {
      sender: "bot",
      content:
        "Hi! I'm the Northbridge assistant. Ask me anything, or type 'human' to chat with a live agent.",
    },
  ]);
  const [input, setInput] = useState("");
  const [clientId, setClientId] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setClientId(generateClientId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for support replies when in live mode
  useEffect(() => {
    if (!liveMode || !sessionId || !clientId) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/chat/guest?clientId=${clientId}&sessionId=${sessionId}`
        );
        const data = await res.json();
        if (data.messages) {
          const supportMessages = data.messages.filter(
            (m: any) => m.senderType === "support"
          );
          const lastSupport = supportMessages[supportMessages.length - 1];
          if (lastSupport) {
            const existingIdx = messages.findIndex(
              (m) => m.content === lastSupport.content && m.sender === "support"
            );
            if (existingIdx === -1) {
              setMessages((prev) => [
                ...prev,
                {
                  sender: "support",
                  content: lastSupport.content,
                  name: lastSupport.senderName,
                },
              ]);
              setWaitingForAgent(false);
            }
          }
        }
      } catch {}
    };

    pollRef.current = setInterval(poll, 3000);
    poll();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMode, sessionId, clientId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");

    if (liveMode) {
      setMessages((prev) => [...prev, { sender: "guest", content: userMsg }]);
      setWaitingForAgent(true);

      try {
        const res = await fetch("/api/chat/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, content: userMsg }),
        });
        const data = await res.json();
        if (data.sessionId) setSessionId(data.sessionId);
      } catch (err) {
        console.error("Chat send failed:", err);
      }
      return;
    }

    // Bot mode - keyword matching
    setMessages((prev) => [...prev, { sender: "guest", content: userMsg }]);

    const lower = userMsg.toLowerCase();
    let matched = false;

    for (const [key, value] of Object.entries(KB)) {
      if (lower.includes(key)) {
        if (key === "human") {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", content: value },
          ]);
          setTimeout(() => {
            setLiveMode(true);
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                content:
                  "You're now connected to live support. Send a message and an agent will respond shortly.",
              },
            ]);
          }, 800);
          matched = true;
          break;
        }
        setTimeout(() => {
          setMessages((prev) => [...prev, { sender: "bot", content: value }]);
        }, 400);
        matched = true;
        break;
      }
    }

    if (!matched) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            content:
              "I didn't quite get that. You can ask about services, pricing, or type 'human' to speak with a live agent.",
          },
        ]);
      }, 400);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#292524] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0c0a09] transition-colors z-50"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[560px] bg-white border border-[#e7e5e4] shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="px-4 py-3 bg-[#292524] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-sm font-medium">
                {liveMode ? "Live Support" : "Northbridge Assistant"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {liveMode && (
                <button
                  onClick={() => {
                    setLiveMode(false);
                    setSessionId(null);
                    setWaitingForAgent(false);
                    setMessages([
                      {
                        sender: "bot",
                        content: "Back to assistant mode. How can I help?",
                      },
                    ]);
                  }}
                  className="text-[10px] text-white/60 hover:text-white px-2 py-0.5"
                >
                  Exit live
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f5f5]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "guest" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 text-sm ${
                    msg.sender === "guest"
                      ? "bg-[#292524] text-white"
                      : msg.sender === "support"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-white text-[#0c0a09] border border-[#e7e5e4]"
                  }`}
                >
                  {msg.sender === "support" && (
                    <p className="text-[10px] font-medium mb-0.5 opacity-70">
                      {msg.name || "Support Agent"}
                    </p>
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}

            {waitingForAgent && (
              <div className="flex justify-start">
                <div className="px-3 py-2 bg-white border border-[#e7e5e4] text-sm text-[#777169]">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#777169] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#777169] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#777169] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies (bot mode only) */}
          {!liveMode && (
            <div className="px-4 py-2 flex gap-2 flex-wrap shrink-0 bg-white border-t border-[#e7e5e4]">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-[#f5f5f5] border border-[#e7e5e4] text-[#777169] hover:text-[#0c0a09] hover:border-[#0c0a09] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 flex gap-2 shrink-0 bg-white border-t border-[#e7e5e4]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                liveMode ? "Type your message..." : "Ask a question..."
              }
              className="flex-1 px-3 py-2 bg-[#f5f5f5] border border-[#e7e5e4] text-sm text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
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
      )}
    </>
  );
}
