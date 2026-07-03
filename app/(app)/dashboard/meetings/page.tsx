"use client";

import { useState, useEffect, useCallback } from "react";
import MeetingCalendar from "@/components/meeting-calendar";
import { getMeetings } from "@/lib/actions/meeting-actions";

type CalendarView = "month" | "week" | "day";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    getMeetings()
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const participantResolver = useCallback(() => [], []);

  if (loading) {
    return (
      <div>
        <p className="text-muted text-sm mb-8">View your scheduled meetings</p>
        <div className="text-center py-12 text-muted text-sm">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted text-sm">
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} scheduled
        </p>
      </div>

      <MeetingCalendar
        meetings={meetings}
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onNavigate={setCurrentDate}
        participantResolver={participantResolver}
      />
    </div>
  );
}
