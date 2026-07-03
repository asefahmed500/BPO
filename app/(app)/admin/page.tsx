"use client";

import { useState, useEffect } from "react";
import { getAllRequirements } from "@/lib/actions/requirement-actions";
import { getAllMeetings } from "@/lib/actions/meeting-actions";
import { getConversations } from "@/lib/actions/message-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { getGoals } from "@/lib/actions/goal-actions";
import { getUserCount } from "@/lib/actions/user-admin-actions";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  href: string;
}

function StatCard({ title, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-hairline p-6 hover:shadow-sm transition-shadow"
    >
      <p className="text-sm text-muted mb-2">{title}</p>
      <p className="text-3xl font-display font-light text-ink">{value}</p>
    </Link>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    users: 0,
    requirements: 0,
    pendingReqs: 0,
    projects: 0,
    meetings: 0,
    conversations: 0,
    goals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [requirements, meetings, conversations, projects, goals, userCount] =
          await Promise.all([
            getAllRequirements(),
            getAllMeetings(),
            getConversations(),
            getProjects(),
            getGoals(),
            getUserCount(),
          ]);
        setStats({
          users: userCount,
          requirements: requirements.length,
          pendingReqs: requirements.filter((r: any) => r.status === "pending").length,
          projects: projects.length,
          meetings: meetings.length,
          conversations: conversations.length,
          goals: goals.length,
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
      <p className="text-muted text-sm mb-8">Platform overview at a glance</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard title="Pending Requirements" value={loading ? "..." : stats.pendingReqs} href="/admin/requirements" />
        <StatCard title="Total Requirements" value={loading ? "..." : stats.requirements} href="/admin/requirements" />
        <StatCard title="Projects" value={loading ? "..." : stats.projects} href="/admin/requirements" />
        <StatCard title="Meetings" value={loading ? "..." : stats.meetings} href="/admin/meetings" />
        <StatCard title="Conversations" value={loading ? "..." : stats.conversations} href="/admin/requirements" />
        <StatCard title="User Goals" value={loading ? "..." : stats.goals} href="/admin/requirements" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-hairline p-6">
          <h2 className="text-base font-display font-light text-ink mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="block px-4 py-3 rounded-xl border border-hairline text-sm text-body hover:border-ink hover:text-ink transition-colors"
            >
              Manage users
            </Link>
            <Link
              href="/admin/requirements"
              className="block px-4 py-3 rounded-xl border border-hairline text-sm text-body hover:border-ink hover:text-ink transition-colors"
            >
              Review pending requirements
            </Link>
            <Link
              href="/admin/meetings"
              className="block px-4 py-3 rounded-xl border border-hairline text-sm text-body hover:border-ink hover:text-ink transition-colors"
            >
              Schedule a meeting
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
