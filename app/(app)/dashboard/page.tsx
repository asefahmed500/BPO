"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { getGoals } from "@/lib/actions/goal-actions";
import { getRequirements } from "@/lib/actions/requirement-actions";
import { getMeetings } from "@/lib/actions/meeting-actions";
import { getProjects } from "@/lib/actions/project-actions";

interface StatsCardProps {
  title: string;
  value: string | number;
  href: string;
  color: string;
}

function StatsCard({ title, value, href, color }: StatsCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-hairline p-6 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">{title}</span>
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
          <span className="text-white text-xs font-medium">{value.toString().charAt(0)}</span>
        </div>
      </div>
      <p className="text-3xl font-display font-light text-ink">{value}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    goals: 0,
    activeGoals: 0,
    requirements: 0,
    pendingReqs: 0,
    projects: 0,
    meetings: 0,
  });
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
        setStats({
          goals: goals.length,
          activeGoals: goals.filter((g: any) => g.status === "active").length,
          requirements: requirements.length,
          pendingReqs: requirements.filter((r: any) => r.status === "pending").length,
          projects: projects.length,
          meetings: meetings.filter((m: any) => m.status === "scheduled").length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <p className="text-muted mb-8">
        Welcome back, {session?.user?.name || "User"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatsCard
          title="Active Goals"
          value={loading ? "..." : stats.activeGoals}
          href="/dashboard/goals"
          color="bg-[#292524]"
        />
        <StatsCard
          title="Pending Requirements"
          value={loading ? "..." : stats.pendingReqs}
          href="/dashboard/requirements"
          color="bg-[#777169]"
        />
        <StatsCard
          title="Projects"
          value={loading ? "..." : stats.projects}
          href="/dashboard/projects"
          color="bg-[#a8a29e]"
        />
        <StatsCard
          title="Upcoming Meetings"
          value={loading ? "..." : stats.meetings}
          href="/dashboard/meetings"
          color="bg-[#292524]"
        />
        <StatsCard
          title="Goals Set"
          value={loading ? "..." : stats.goals}
          href="/dashboard/goals"
          color="bg-[#777169]"
        />
        <StatsCard
          title="Requirements"
          value={loading ? "..." : stats.requirements}
          href="/dashboard/requirements"
          color="bg-[#a8a29e]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-hairline p-6">
          <h2 className="text-base font-display font-light text-ink mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/requirements"
              className="block px-4 py-3 rounded-xl border border-hairline text-sm text-body hover:border-ink hover:text-ink transition-colors"
            >
              Submit a new requirement
            </Link>
            <Link
              href="/dashboard/goals"
              className="block px-4 py-3 rounded-xl border border-hairline text-sm text-body hover:border-ink hover:text-ink transition-colors"
            >
              Set a new goal
            </Link>
            <Link
              href="/dashboard/chat"
              className="block px-4 py-3 rounded-xl border border-hairline text-sm text-body hover:border-ink hover:text-ink transition-colors"
            >
              Ask AI assistant
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-hairline p-6">
          <h2 className="text-base font-display font-light text-ink mb-4">Messages</h2>
          <p className="text-sm text-muted">
            Check your messages to communicate with your support team and admin.
          </p>
          <Link
            href="/dashboard/messages"
            className="inline-block mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Open Messages
          </Link>
        </div>
      </div>
    </div>
  );
}
