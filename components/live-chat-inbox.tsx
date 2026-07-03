"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function LiveChatInbox() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [platformUsers, setPlatformUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/support/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      if (data.sessions?.length > 0 && !activeSession) {
        setActiveSession(data.sessions[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!activeSession) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat/support/messages?sessionId=${activeSession}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [activeSession]);

  useEffect(() => {
    const es = new EventSource("/api/chat/support/stream");
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "new_message") {
          loadSessions();
          if (payload.sessionId === activeSession) {
            setMessages((prev) => {
              const exists = prev.some(
                (m) => m._id === payload.message._id
              );
              return exists ? prev : [...prev, payload.message];
            });
          }
        }
        if (payload.type === "support_reply" && payload.sessionId !== activeSession) {
          loadSessions();
        }
      } catch {}
    };
    return () => es.close();
  }, [activeSession, loadSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadPlatformUsers = async () => {
    try {
      const res = await fetch("/api/chat/admin/users");
      const data = await res.json();
      setPlatformUsers(data.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeSession) return;
    const content = reply.trim();
    setReply("");

    setMessages((prev) => [
      ...prev,
      {
        _id: `temp_${Date.now()}`,
        senderType: "support",
        senderName: "You",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession, content }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === `temp_${Date.now() - 100}` ? data.message : m
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = async () => {
    if (!activeSession) return;
    await fetch("/api/chat/support/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSession, action: "close" }),
    });
    loadSessions();
    setActiveSession(null);
    setMessages([]);
  };

  const handleStartWithUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !firstMessage.trim()) return;
    try {
      const res = await fetch("/api/chat/admin/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          content: firstMessage.trim(),
        }),
      });
      const data = await res.json();
      setShowUserPicker(false);
      setSelectedUserId(null);
      setFirstMessage("");
      setUserSearch("");
      loadSessions();
      if (data.sessionId) {
        setActiveSession(data.sessionId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openUserPicker = () => {
    setShowUserPicker(true);
    if (platformUsers.length === 0) loadPlatformUsers();
  };

  const active = sessions.find((s) => s._id === activeSession);

  const displayName = (s: any) => {
    if (s.sessionType === "user" && s.userName) return s.userName;
    return s.visitorName || "Guest";
  };

  const filteredUsers = platformUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex gap-4 h-[calc(100dvh-13rem)]">
      {/* Session list */}
      <div className="w-80 shrink-0 bg-white border border-hairline overflow-y-auto flex flex-col">
        <div className="px-4 py-3 border-b border-hairline shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-ink">Live Chats</h2>
              <p className="text-xs text-muted mt-0.5">
                {sessions.filter((s) => s.status === "waiting").length} waiting
              </p>
            </div>
            <button
              onClick={openUserPicker}
              className="text-xs px-3 py-1.5 bg-[#292524] text-white hover:bg-[#0c0a09] transition-colors"
            >
              + New
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-muted">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-muted text-center">
            No active chats.
            <br />
            Click <span className="font-medium">+ New</span> to message a user.
          </div>
        ) : (
          sessions.map((s) => (
            <button
              key={s._id}
              onClick={() => setActiveSession(s._id)}
              className={`w-full text-left px-4 py-3 border-b border-hairline hover:bg-canvas transition-colors ${
                activeSession === s._id ? "bg-canvas" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-ink truncate">
                    {displayName(s)}
                  </span>
                  {s.sessionType === "user" && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9] shrink-0">
                      USER
                    </span>
                  )}
                </div>
                {s.status === "waiting" && (
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
                )}
                {s.status === "active" && (
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted truncate">
                {s.lastMessageContent || "No messages yet"}
              </p>
              {s.unreadForSupport > 0 && (
                <span className="inline-block mt-1 text-[10px] font-medium text-white bg-[#ef4444] px-1.5 py-0.5">
                  {s.unreadForSupport} new
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Chat panel */}
      <div className="flex-1 bg-white border border-hairline flex flex-col">
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted">
              Select a chat or start a new conversation
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">
                    {displayName(active)}
                  </p>
                  {active.sessionType === "user" && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9]">
                      {active.userRole || "USER"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {active.sessionType === "user" && active.userEmail
                    ? active.userEmail
                    : active.status === "waiting"
                    ? "Waiting for response"
                    : active.status === "active"
                    ? "Active conversation"
                    : "Closed"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-xs text-muted hover:text-[#ef4444] border border-hairline px-3 py-1.5 hover:border-[#ef4444] transition-colors"
              >
                Close chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderType === "support"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 text-sm ${
                      msg.senderType === "support"
                        ? "bg-[#292524] text-white"
                        : msg.senderType === "ai"
                        ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                        : "bg-canvas text-ink border border-hairline"
                    }`}
                  >
                    {msg.senderType !== "support" && msg.senderType !== "ai" && (
                      <p className="text-[10px] font-medium mb-0.5 text-muted">
                        {msg.senderName || "User"}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.senderType === "support"
                          ? "text-white/50"
                          : "text-muted"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleReply}
              className="p-4 border-t border-hairline flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="px-4 py-2 bg-[#292524] text-white text-sm font-medium hover:bg-[#0c0a09] transition-colors disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {/* User picker modal */}
      {showUserPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUserPicker(false)}
        >
          <div
            className="bg-white border border-hairline w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-hairline shrink-0">
              <h3 className="text-sm font-medium text-ink">
                Start chat with platform user
              </h3>
            </div>

            {!selectedUserId ? (
              <>
                <div className="px-4 py-2 border-b border-hairline shrink-0">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="p-4 text-sm text-muted text-center">
                      No users found
                    </p>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => setSelectedUserId(u._id)}
                        className="w-full text-left px-4 py-3 border-b border-hairline hover:bg-canvas transition-colors"
                      >
                        <p className="text-sm font-medium text-ink">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9] mt-1 inline-block">
                          {u.role?.toUpperCase()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <form
                onSubmit={handleStartWithUser}
                className="flex-1 flex flex-col p-4 gap-3"
              >
                <div className="bg-canvas border border-hairline px-3 py-2">
                  <p className="text-sm font-medium text-ink">
                    {platformUsers.find((u) => u._id === selectedUserId)?.name}
                  </p>
                  <p className="text-xs text-muted">
                    {platformUsers.find((u) => u._id === selectedUserId)?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="text-xs text-muted hover:text-ink self-start"
                >
                  ← Choose different user
                </button>
                <textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Type your first message..."
                  rows={4}
                  className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink resize-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!firstMessage.trim()}
                  className="px-4 py-2 bg-[#292524] text-white text-sm font-medium hover:bg-[#0c0a09] transition-colors disabled:opacity-40"
                >
                  Send message
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowUserPicker(false);
                setSelectedUserId(null);
                setFirstMessage("");
                setUserSearch("");
              }}
              className="px-4 py-2 border-t border-hairline text-xs text-muted hover:text-ink shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
