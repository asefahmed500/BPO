"use client";

import { useState, useEffect } from "react";
import { getAllRequirements } from "@/lib/actions/requirement-actions";
import { getAllMeetings } from "@/lib/actions/meeting-actions";
import { getConversations } from "@/lib/actions/message-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { getGoals } from "@/lib/actions/goal-actions";
import { getUserCount } from "@/lib/actions/user-admin-actions";
import { Users, AlertCircle, FolderKanban, CalendarDays, MessageSquare, Target } from "lucide-react";
import {
  ActivityList,
  BarChart,
  MetricCard,
  MetricGrid,
  PageHeader,
  Panel,
  QuickActionRow,
} from "@/components/dashboard/widgets";

const REQ_STATUS_ORDER = [
  { key: "pending", label: "Pending" },
  { key: "reviewing", label: "Reviewing" },
  { key: "approved", label: "Approved" },
  { key: "in-progress", label: "In Prog." },
  { key: "completed", label: "Done" },
  { key: "rejected", label: "Rejected" },
];

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type Tone = "mint" | "peach" | "lavender";
function reqTone(status: string): Tone {
  if (status === "approved" || status === "in-progress" || status === "completed") return "mint";
  if (status === "reviewing") return "lavender";
  return "peach";
}

export default function AdminPage() {
  const [data, setData] = useState<{
    requirements: any[];
    projects: any[];
    meetings: any[];
    conversations: any[];
    goals: any[];
    userCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [requirements, meetings, conversations, projects, goals, userCount] = await Promise.all([
          getAllRequirements(),
          getAllMeetings(),
          getConversations(),
          getProjects(),
          getGoals(),
          getUserCount(),
        ]);
        setData({ requirements, projects, meetings, conversations, goals, userCount });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const reqs = data?.requirements ?? [];
  const projects = data?.projects ?? [];
  const pendingReqs = reqs.filter((r) => r.status === "pending").length;

  const chartData = REQ_STATUS_ORDER.map((s) => ({
    label: s.label,
    value: reqs.filter((r) => r.status === s.key).length,
  })).filter((d) => d.value > 0);

  const activity = [...reqs, ...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((item: any) => ({
      text: (
        <span>
          <span className="font-medium">{item.title || item.name}</span>
          <span className="text-muted"> · {item.status}</span>
        </span>
      ),
      time: timeAgo(item.createdAt),
      tone: reqTone(item.status) as Tone,
    }));

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="Platform activity at a glance"
        action={{ label: "Manage users", href: "/admin/users" }}
      />

      <MetricGrid>
        <MetricCard icon={Users} label="Users" value={data?.userCount ?? 0} sub="registered accounts" tone="ink" loading={loading} />
        <MetricCard icon={AlertCircle} label="Pending Review" value={pendingReqs} sub="requirements awaiting" tone="peach" loading={loading} />
        <MetricCard icon={FolderKanban} label="Projects" value={data?.projects.length ?? 0} sub="all time" tone="sky" loading={loading} />
        <MetricCard icon={CalendarDays} label="Meetings" value={data?.meetings.length ?? 0} sub="scheduled" tone="lavender" loading={loading} />
        <MetricCard icon={MessageSquare} label="Conversations" value={data?.conversations.length ?? 0} sub="threads" tone="mint" loading={loading} />
        <MetricCard icon={Target} label="Goals" value={data?.goals.length ?? 0} sub="user goals" tone="ink" loading={loading} />
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Requirements by status" action={{ label: "Review", href: "/admin/requirements" }} className="lg:col-span-2">
          {chartData.length > 0 ? (
            <BarChart data={chartData} totalLabel="requirements total" />
          ) : (
            <p className="text-sm text-muted py-8 text-center">{loading ? "Loading…" : "No requirements yet"}</p>
          )}
        </Panel>

        <Panel title="Recent activity">
          <ActivityList items={activity} emptyText={loading ? "Loading…" : "No recent activity"} />
        </Panel>
      </div>

      <Panel title="Quick actions" className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionRow href="/admin/users" label="Manage users" />
          <QuickActionRow href="/admin/requirements" label="Review requirements" />
          <QuickActionRow href="/admin/meetings" label="Schedule a meeting" />
        </div>
      </Panel>
    </div>
  );
}
