"use client";

import { useState, useEffect } from "react";
import {
  getAllMeetings,
  createMeeting,
  updateMeetingStatus,
} from "@/lib/actions/meeting-actions";
import { getAssignableUsers } from "@/lib/actions/user-admin-actions";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("30");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const load = async () => {
    try {
      const [meetingData, userData] = await Promise.all([
        getAllMeetings(),
        getAssignableUsers(),
      ]);
      setMeetings(meetingData);
      setUsers(userData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setDuration("30");
    setSelectedUserId("");
    setMeetingLink("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMeeting({
        title,
        description,
        type: "one-on-one",
        scheduledAt,
        duration: Number(duration),
        timezone: "UTC",
        location: "",
        meetingLink: meetingLink || "",
        recurring: "none",
        participantIds: selectedUserId ? [selectedUserId] : [],
        agendaItems: [],
      });
      setShowForm(false);
      resetForm();
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatus = async (id: string, status: "completed" | "cancelled") => {
    try {
      await updateMeetingStatus(id, status);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const participantNames = (meeting: any) => {
    if (!meeting.participantIds || meeting.participantIds.length === 0)
      return "No participants";
    const names = meeting.participantIds
      .map((pid: string) => {
        const u = users.find((u) => u._id === pid);
        return u ? u.name : null;
      })
      .filter(Boolean);
    if (meeting.creator?.name && !names.includes(meeting.creator.name)) {
      names.unshift(meeting.creator.name);
    }
    return names.length > 0 ? names.join(", ") : "No participants";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted text-sm">Manage and schedule meetings</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
        >
          {showForm ? "Cancel" : "Schedule Meeting"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-hairline p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-body-strong mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body-strong mb-1">Date &amp; Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="5"
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">
              Select Participant
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
            >
              <option value="">No participant (admin only)</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">
              Meeting Link (optional)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              placeholder="https://meet.google.com/..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Schedule Meeting
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm">No meetings</div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting: any) => (
            <div
              key={meeting._id}
              className="bg-white rounded-2xl border border-hairline p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-display font-light text-ink">
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {participantNames(meeting)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    statusColors[meeting.status] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  {meeting.status}
                </span>
              </div>
              {meeting.description && (
                <p className="text-xs text-muted mb-2">{meeting.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-soft mb-3">
                <span>
                  {new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{meeting.duration} min</span>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join link
                  </a>
                )}
              </div>
              {meeting.status === "scheduled" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatus(meeting._id, "completed")}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleStatus(meeting._id, "cancelled")}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
