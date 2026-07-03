"use client";

import { useState, useEffect } from "react";
import { getMeetings } from "@/lib/actions/meeting-actions";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeetings()
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="text-muted text-sm mb-8">View your scheduled meetings</p>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting: any) => (
            <div
              key={meeting._id}
              className="bg-white rounded-2xl border border-hairline p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-display font-light text-ink">
                  {meeting.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    statusColors[meeting.status] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  {meeting.status}
                </span>
              </div>
              {meeting.agenda && (
                <p className="text-xs text-muted mb-3">{meeting.agenda}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-soft">
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
                    className="text-ink underline underline-offset-2"
                  >
                    Join
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
