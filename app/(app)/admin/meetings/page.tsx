"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import MeetingCalendar from "@/components/meeting-calendar";
import ScheduleMeetingForm from "@/components/schedule-meeting-form";
import {
  getAllMeetings,
  createMeeting,
  updateMeetingStatus,
} from "@/lib/actions/meeting-actions";
import { getAssignableUsers } from "@/lib/actions/user-admin-actions";

type CalendarView = "month" | "week" | "day";

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const handleCreate = async (data: any) => {
    await createMeeting(data);
    await load();
  };

  const handleComplete = useCallback(async (id: string) => {
    await updateMeetingStatus(id, "completed");
    await load();
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    await updateMeetingStatus(id, "cancelled");
    await load();
  }, []);

  const handleSlotSelect = useCallback((date: Date) => {
    setPrefillDate(date);
    setShowForm(true);
  }, []);

  const handleNewMeeting = () => {
    setPrefillDate(null);
    setShowForm(true);
  };

  const participantResolver = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => users.find((u) => u._id === id)?.name)
        .filter(Boolean) as string[],
    [users]
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted text-sm">Manage and schedule meetings</p>
        </div>
        <div className="text-center py-12 text-muted text-sm">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted text-sm">
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} total
        </p>
        <button
          onClick={handleNewMeeting}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0c0a09] text-[#fafafa] text-sm font-medium hover:bg-[#292524] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      <MeetingCalendar
        meetings={meetings}
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onNavigate={setCurrentDate}
        onSelectSlot={handleSlotSelect}
        participantResolver={participantResolver}
        admin
        onComplete={handleComplete}
        onCancel={handleCancel}
      />

      {showForm && (
        <ScheduleMeetingForm
          users={users}
          onCreate={handleCreate}
          onClose={() => setShowForm(false)}
          prefillDate={prefillDate}
        />
      )}
    </div>
  );
}
