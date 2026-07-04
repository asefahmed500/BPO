"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getGoals } from "@/lib/actions/goal-actions";
import { getRequirements } from "@/lib/actions/requirement-actions";
import { getMeetings } from "@/lib/actions/meeting-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { Target, Goal, AlertCircle, FileText, FolderKanban, CalendarDays } from "lucide-react";
import {
  ActivityList,
  BarChart,
  MetricCard,
  MetricGrid,
  PageHeader,
  Panel,
  QuickActionRow,
} from "@/components/dashboard/widgets";

const PROJ_STATUS_ORDER = [
  { key: "submitted", label: "Submitted" },
  { key: "under-review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Done" },
  { key: "needs-revision", label: "Revision" },
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
function projTone(status: string): Tone {
  if (status === "approved" || status === "active" || status === "completed") return "mint";
  if (status === "under-review") return "lavender";
  return "peach";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<{
    goals: any[];
    requirements: any[];
    meetings: any[];
    projects: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [goals, requirements, meetings, projects] = await Promise.all([
          getGoals(),
          getRequirements(),
          getMeetings(),
          getProjects(),
        ]);
        setData({ goals, requirements, meetings, projects });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const goals = data?.goals ?? [];
  const reqs = data?.requirements ?? [];
  const projects = data?.projects ?? [];
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const pendingReqs = reqs.filter((r) => r.status === "pending").length;
  const upcomingMeetings = data?.meetings.filter((m) => m.status === "scheduled").length ?? 0;

  const chartData = PROJ_STATUS_ORDER.map((s) => ({
    label: s.label,
    value: projects.filter((p) => p.status === s.key).length,
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
      tone: projTone(item.status) as Tone,
    }));

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`Welcome back, ${session?.user?.name || "User"}`}
        action={{ label: "New requirement", href: "/dashboard/requirements" }}
      />

      <MetricGrid>
        <MetricCard icon={Target} label="Active Goals" value={activeGoals} sub="in progress" tone="mint" loading={loading} />
        <MetricCard icon={Goal} label="Goals Set" value={goals.length} sub="all time" tone="ink" loading={loading} />
        <MetricCard icon={AlertCircle} label="Pending" value={pendingReqs} sub="requirements" tone="peach" loading={loading} />
        <MetricCard icon={FileText} label="Requirements" value={reqs.length} sub="submitted" tone="sky" loading={loading} />
        <MetricCard icon={FolderKanban} label="Projects" value={projects.length} sub="all time" tone="lavender" loading={loading} />
        <MetricCard icon={CalendarDays} label="Meetings" value={upcomingMeetings} sub="upcoming" tone="peach" loading={loading} />
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Projects by status" action={{ label: "View", href: "/dashboard/projects" }} className="lg:col-span-2">
          {chartData.length > 0 ? (
            <BarChart data={chartData} totalLabel="projects total" />
          ) : (
            <p className="text-sm text-muted py-8 text-center">{loading ? "Loading…" : "No projects yet"}</p>
          )}
        </Panel>

        <Panel title="Recent activity" action={{ label: "Inbox", href: "/dashboard/messages" }}>
          <ActivityList items={activity} emptyText={loading ? "Loading…" : "No recent activity"} />
        </Panel>
      </div>

      <Panel title="Quick actions" className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionRow href="/dashboard/requirements" label="Submit a requirement" />
          <QuickActionRow href="/dashboard/goals" label="Set a new goal" />
          <QuickActionRow href="/dashboard/chat" label="Ask AI assistant" />
        </div>
      </Panel>
    </div>
  );
}
