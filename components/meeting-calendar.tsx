"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Link2,
  Users,
  X,
} from "lucide-react";

type CalendarView = "month" | "week" | "day";

type Meeting = {
  _id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  endDate?: string | null;
  duration: number;
  type: string;
  status: string;
  location?: string;
  meetingLink?: string;
  createdBy?: string;
  participantIds?: string[];
  creator?: { id: string; name: string } | null;
};

type Props = {
  meetings: Meeting[];
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  currentDate: Date;
  onNavigate: (d: Date) => void;
  onSelectSlot?: (date: Date) => void;
  participantResolver?: (ids: string[]) => string[];
  admin?: boolean;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
};

const typeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "one-on-one": { bg: "bg-[#eff6ff]", border: "border-l-[#3b82f6]", text: "text-[#1d4ed8]", dot: "bg-[#3b82f6]" },
  team: { bg: "bg-[#f5f3ff]", border: "border-l-[#8b5cf6]", text: "text-[#6d28d9]", dot: "bg-[#8b5cf6]" },
  client: { bg: "bg-[#f0fdf4]", border: "border-l-[#22c55e]", text: "text-[#15803d]", dot: "bg-[#22c55e]" },
  review: { bg: "bg-[#fffbeb]", border: "border-l-[#f59e0b]", text: "text-[#b45309]", dot: "bg-[#f59e0b]" },
  standup: { bg: "bg-[#fdf2f8]", border: "border-l-[#ec4899]", text: "text-[#be185d]", dot: "bg-[#ec4899]" },
};

const statusColors: Record<string, string> = {
  scheduled: "bg-[#eff6ff] text-[#1d4ed8]",
  "in-progress": "bg-[#fffbeb] text-[#b45309]",
  completed: "bg-[#f0fdf4] text-[#15803d]",
  cancelled: "bg-[#fef2f2] text-[#b91c1c]",
  "no-show": "bg-[#f3f4f6] text-[#6b7280]",
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getTypeColor(type: string) {
  return typeColors[type] || typeColors["one-on-one"];
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthGrid(date: Date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const startDay = firstOfMonth.getDay();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - startDay);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatHour(hour: number) {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour} ${period}`;
}

function getMeetingsForDay(meetings: Meeting[], day: Date) {
  return meetings.filter((m) => {
    const mDate = new Date(m.scheduledAt);
    return sameDay(mDate, day);
  });
}

function MeetingDetailModal({
  meeting,
  onClose,
  participantResolver,
  admin,
  onComplete,
  onCancel,
}: {
  meeting: Meeting;
  onClose: () => void;
  participantResolver?: (ids: string[]) => string[];
  admin?: boolean;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  const c = getTypeColor(meeting.type);
  const start = new Date(meeting.scheduledAt);
  const participants = participantResolver && meeting.participantIds ? participantResolver(meeting.participantIds) : [];
  const isCancelled = meeting.status === "cancelled";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white border border-hairline max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 ${c.dot}`} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className={`font-display text-xl text-ink ${isCancelled ? "line-through opacity-60" : ""}`}>
              {meeting.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[meeting.status] || statusColors.scheduled}`}>
              {meeting.status}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                {" at "}
                {formatTime(start)}
                {" ("}{meeting.duration} min)
              </span>
            </div>

            {meeting.location && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{meeting.location}</span>
              </div>
            )}

            {meeting.meetingLink && (
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="w-4 h-4 shrink-0 text-muted" />
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3b82f6] hover:underline"
                >
                  Join meeting
                </a>
              </div>
            )}

            {participants.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-muted">
                <Users className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{participants.join(", ")}</span>
              </div>
            )}

            {meeting.creator?.name && (
              <p className="text-xs text-muted-soft">Scheduled by {meeting.creator.name}</p>
            )}
          </div>

          {meeting.description && (
            <div className="border-t border-hairline pt-4 mb-4">
              <p className="text-xs text-muted-soft mb-1">Description</p>
              <p className="text-sm text-ink">{meeting.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            {admin && meeting.status === "scheduled" && (
              <>
                {onComplete && (
                  <button
                    onClick={() => { onComplete(meeting._id); onClose(); }}
                    className="flex-1 px-3 py-2 bg-[#22c55e] text-white text-sm font-medium hover:bg-[#16a34a] transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                {onCancel && (
                  <button
                    onClick={() => { onCancel(meeting._id); onClose(); }}
                    className="flex-1 px-3 py-2 bg-[#ef4444] text-white text-sm font-medium hover:bg-[#dc2626] transition-colors"
                  >
                    Cancel Meeting
                  </button>
                )}
              </>
            )}
            {meeting.meetingLink && meeting.status !== "cancelled" && (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-[#fafafa] transition-colors"
              >
                Join
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthView({
  meetings,
  currentDate,
  onSelectSlot,
  onSelectMeeting,
}: {
  meetings: Meeting[];
  currentDate: Date;
  onSelectSlot?: (date: Date) => void;
  onSelectMeeting: (m: Meeting) => void;
}) {
  const days = useMemo(() => getMonthGrid(currentDate), [currentDate]);
  const today = new Date();

  return (
    <div className="bg-white border border-hairline">
      <div className="grid grid-cols-7 border-b border-hairline">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center py-2 text-xs font-medium text-muted border-r border-hairline last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayMeetings = getMeetingsForDay(meetings, day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = sameDay(day, today);
          const col = i % 7;
          return (
            <div
              key={i}
              onClick={() => onSelectSlot && isCurrentMonth && onSelectSlot(day)}
              className={`min-h-[100px] sm:min-h-[120px] border-r border-b border-hairline p-1 ${
                col === 6 ? "border-r-0" : ""
              } ${i >= 35 ? "border-b-0" : ""} ${
                onSelectSlot && isCurrentMonth ? "cursor-pointer hover:bg-canvas" : ""
              } ${isToday ? "bg-[#fefce8]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs ${
                    isToday
                      ? "bg-[#0c0a09] text-[#fafafa] rounded-full w-6 h-6 flex items-center justify-center font-medium"
                      : isCurrentMonth
                      ? "text-ink"
                      : "text-muted-soft"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayMeetings.slice(0, 3).map((m) => {
                  const c = getTypeColor(m.type);
                  return (
                    <div
                      key={m._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeeting(m);
                      }}
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 truncate ${c.bg} ${c.text} ${c.border} border-l-2 ${
                        m.status === "cancelled" ? "line-through opacity-50" : ""
                      } cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      {new Date(m.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} {m.title}
                    </div>
                  );
                })}
                {dayMeetings.length > 3 && (
                  <p className="text-[10px] text-muted px-1">+{dayMeetings.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeGridView({
  meetings,
  days,
  onSelectSlot,
  onSelectMeeting,
  label,
}: {
  meetings: Meeting[];
  days: Date[];
  onSelectSlot?: (date: Date) => void;
  onSelectMeeting: (m: Meeting) => void;
  label: string;
}) {
  const today = new Date();
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div className="bg-white border border-hairline overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid border-b border-hairline" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
          <div className="border-r border-hairline" />
          {days.map((day, i) => {
            const isToday = sameDay(day, today);
            return (
              <div key={i} className={`text-center py-2 border-r border-hairline last:border-r-0 ${hoveredCol === i ? "bg-canvas" : ""}`}>
                <p className="text-xs text-muted">{WEEKDAYS[day.getDay()]}</p>
                <p className={`text-lg font-display ${isToday ? "text-[#3b82f6]" : "text-ink"}`}>
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)`, display: "grid" }}>
          <div className="border-r border-hairline">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 border-b border-hairline relative">
                <span className="absolute top-0 right-1 text-[10px] text-muted-soft -translate-y-1/2">
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>

          {days.map((day, colIndex) => {
            const dayMeetings = getMeetingsForDay(meetings, day).filter((m) => m.status !== "cancelled" || true);
            return (
              <div
                key={colIndex}
                className={`border-r border-hairline last:border-r-0 relative ${hoveredCol === colIndex ? "bg-canvas/50" : ""}`}
                onMouseEnter={() => setHoveredCol(colIndex)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={(e) => {
                      if (!onSelectSlot) return;
                      const slot = new Date(day);
                      slot.setHours(hour, 0, 0, 0);
                      onSelectSlot(slot);
                    }}
                    className={`h-14 border-b border-hairline ${onSelectSlot ? "cursor-pointer hover:bg-canvas" : ""}`}
                  />
                ))}

                {dayMeetings.map((m) => {
                  const start = new Date(m.scheduledAt);
                  const startHour = start.getHours() + start.getMinutes() / 60;
                  const heightUnits = m.duration / 60;
                  const c = getTypeColor(m.type);
                  return (
                    <div
                      key={m._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeeting(m);
                      }}
                      className={`absolute left-0.5 right-0.5 ${c.bg} ${c.text} ${c.border} border-l-2 p-1 text-[10px] sm:text-xs cursor-pointer hover:opacity-80 transition-opacity overflow-hidden z-10 ${
                        m.status === "cancelled" ? "line-through opacity-50" : ""
                      }`}
                      style={{
                        top: `${startHour * 56}px`,
                        height: `${Math.max(heightUnits * 56, 20)}px`,
                      }}
                    >
                      <p className="font-medium truncate">{m.title}</p>
                      <p className="truncate opacity-80">{formatTime(start)}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MeetingCalendar({
  meetings,
  view,
  onViewChange,
  currentDate,
  onNavigate,
  onSelectSlot,
  participantResolver,
  admin,
  onComplete,
  onCancel,
}: Props) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const headerLabel = useMemo(() => {
    if (view === "month") {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (view === "week") {
      const ws = getWeekStart(currentDate);
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      if (ws.getMonth() === we.getMonth()) {
        return `${MONTHS[ws.getMonth()]} ${ws.getDate()} - ${we.getDate()}, ${ws.getFullYear()}`;
      }
      return `${MONTHS[ws.getMonth()]} ${ws.getDate()} - ${MONTHS[we.getMonth()]} ${we.getDate()}, ${we.getFullYear()}`;
    }
    return `${currentDate.toLocaleDateString("en-US", { weekday: "long" })}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [view, currentDate]);

  const navigate = useCallback(
    (direction: "prev" | "next" | "today") => {
      const d = new Date(currentDate);
      if (direction === "today") {
        onNavigate(new Date());
        return;
      }
      if (view === "month") {
        d.setMonth(d.getMonth() + (direction === "next" ? 1 : -1));
      } else if (view === "week") {
        d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
      } else {
        d.setDate(d.getDate() + (direction === "next" ? 1 : -1));
      }
      onNavigate(d);
    },
    [currentDate, view, onNavigate]
  );

  const weekDays = useMemo(() => {
    if (view !== "week") return [];
    const ws = getWeekStart(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [view, currentDate]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("prev")}
              className="p-1.5 hover:bg-canvas border border-hairline transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 text-ink" />
            </button>
            <button
              onClick={() => navigate("next")}
              className="p-1.5 hover:bg-canvas border border-hairline transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 text-ink" />
            </button>
          </div>
          <button
            onClick={() => navigate("today")}
            className="px-3 py-1.5 border border-hairline text-sm text-ink hover:bg-canvas transition-colors"
          >
            Today
          </button>
          <h2 className="font-display text-lg text-ink">{headerLabel}</h2>
        </div>

        <div className="flex items-center gap-0 border border-hairline">
          {(["day", "week", "month"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm capitalize transition-colors border-r border-hairline last:border-r-0 ${
                view === v
                  ? "bg-[#0c0a09] text-[#fafafa]"
                  : "text-ink hover:bg-canvas"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(typeColors).map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 ${c.dot}`} />
            <span className="text-xs text-muted capitalize">{type.replace(/-/g, " ")}</span>
          </div>
        ))}
      </div>

      {view === "month" && (
        <MonthView
          meetings={meetings}
          currentDate={currentDate}
          onSelectSlot={onSelectSlot}
          onSelectMeeting={setSelectedMeeting}
        />
      )}

      {view === "week" && (
        <TimeGridView
          meetings={meetings}
          days={weekDays}
          onSelectSlot={onSelectSlot}
          onSelectMeeting={setSelectedMeeting}
          label="Week"
        />
      )}

      {view === "day" && (
        <TimeGridView
          meetings={meetings}
          days={[currentDate]}
          onSelectSlot={onSelectSlot}
          onSelectMeeting={setSelectedMeeting}
          label="Day"
        />
      )}

      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          participantResolver={participantResolver}
          admin={admin}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
