"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, X } from "lucide-react";

type User = { _id: string; name: string; role: string };

type Props = {
  users: User[];
  onCreate: (data: {
    title: string;
    description: string;
    type: string;
    scheduledAt: string;
    duration: number;
    timezone: string;
    location: string;
    meetingLink: string;
    recurring: string;
    participantIds: string[];
    agendaItems: { title: string; duration: number }[];
  }) => Promise<void>;
  onClose: () => void;
  prefillDate?: Date | null;
};

const meetingTypes = [
  { value: "one-on-one", label: "One-on-One" },
  { value: "team", label: "Team Meeting" },
  { value: "client", label: "Client Meeting" },
  { value: "review", label: "Review" },
  { value: "standup", label: "Standup" },
];

const recurringOptions = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

function toDatetimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ScheduleMeetingForm({ users, onCreate, onClose, prefillDate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("one-on-one");
  const [scheduledAt, setScheduledAt] = useState(
    prefillDate ? toDatetimeLocal(prefillDate) : ""
  );
  const [duration, setDuration] = useState("30");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [recurring, setRecurring] = useState("none");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [agendaItems, setAgendaItems] = useState<{ title: string; duration: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const addAgendaItem = () => {
    setAgendaItems((prev) => [...prev, { title: "", duration: 15 }]);
  };

  const updateAgendaItem = (index: number, field: "title" | "duration", value: string) => {
    setAgendaItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "duration" ? Number(value) : value }
          : item
      )
    );
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({
        title,
        description,
        type,
        scheduledAt,
        duration: Number(duration),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location,
        meetingLink,
        recurring,
        participantIds: selectedUsers,
        agendaItems: agendaItems.filter((a) => a.title.trim()),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white border border-hairline max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-hairline sticky top-0 bg-white z-10">
          <h3 className="font-display text-lg text-ink flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Meeting
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-canvas transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm text-body-strong mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              placeholder="Weekly sync, project review..."
            />
          </div>

          <div>
            <label className="block text-sm text-body-strong mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink resize-none"
              placeholder="Meeting purpose and context..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Duration (min)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              >
                {meetingTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                placeholder="Conference Room A, Zoom..."
              />
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Meeting Link</label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-body-strong mb-1.5">Recurring</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
            >
              {recurringOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {recurring !== "none" && (
              <p className="text-xs text-muted mt-1">12 instances will be created automatically.</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-body-strong mb-1.5">Participants</label>
            <div className="border border-hairline max-h-40 overflow-y-auto">
              {users.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted">No users available</p>
              ) : (
                users.map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-canvas cursor-pointer border-b border-hairline last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u._id)}
                      onChange={() => toggleUser(u._id)}
                      className="accent-[#0c0a09]"
                    />
                    <span className="text-sm text-ink">{u.name}</span>
                    <span className="text-xs text-muted">({u.role})</span>
                  </label>
                ))
              )}
            </div>
            {selectedUsers.length > 0 && (
              <p className="text-xs text-muted mt-1">{selectedUsers.length} selected</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-body-strong">Agenda Items</label>
              <button
                type="button"
                onClick={addAgendaItem}
                className="flex items-center gap-1 text-xs text-ink hover:text-muted transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add item
              </button>
            </div>
            {agendaItems.length === 0 ? (
              <p className="text-xs text-muted-soft">No agenda items</p>
            ) : (
              <div className="space-y-2">
                {agendaItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateAgendaItem(i, "title", e.target.value)}
                      placeholder="Topic..."
                      className="flex-1 px-3 py-1.5 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                    />
                    <select
                      value={item.duration}
                      onChange={(e) => updateAgendaItem(i, "duration", e.target.value)}
                      className="px-2 py-1.5 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                    >
                      <option value="5">5m</option>
                      <option value="10">10m</option>
                      <option value="15">15m</option>
                      <option value="30">30m</option>
                      <option value="45">45m</option>
                      <option value="60">60m</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(i)}
                      className="p-1.5 hover:bg-[#fef2f2] transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-hairline text-sm text-ink hover:bg-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0c0a09] text-[#fafafa] text-sm font-medium hover:bg-[#292524] transition-colors disabled:opacity-50"
            >
              {submitting ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
