"use client";

import { useState, useEffect } from "react";
import { getProjects } from "@/lib/actions/project-actions";
import Link from "next/link";
import { MessageSquare, DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  submitted: "bg-[#eff6ff] text-[#1d4ed8]",
  "under-review": "bg-[#fffbeb] text-[#b45309]",
  approved: "bg-[#f0fdf4] text-[#15803d]",
  active: "bg-[#f0fdf4] text-[#15803d]",
  "needs-revision": "bg-[#fef3c7] text-[#92400e]",
  "on-hold": "bg-[#f3f4f6] text-[#6b7280]",
  completed: "bg-[#f0f9ff] text-[#0369a1]",
  cancelled: "bg-[#fef2f2] text-[#b91c1c]",
  rejected: "bg-[#fef2f2] text-[#b91c1c]",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      setProjects(await getProjects());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all"
    ? projects
    : projects.filter((p) => p.status === filter);

  const counts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filterOptions = [
    { value: "all", label: `All (${projects.length})` },
    { value: "submitted", label: `Submitted (${counts.submitted || 0})` },
    { value: "under-review", label: `Under Review (${counts["under-review"] || 0})` },
    { value: "needs-revision", label: `Needs Revision (${counts["needs-revision"] || 0})` },
    { value: "approved", label: `Approved (${counts.approved || 0})` },
    { value: "active", label: `Active (${counts.active || 0})` },
    { value: "rejected", label: `Rejected (${counts.rejected || 0})` },
    { value: "completed", label: `Completed (${counts.completed || 0})` },
  ];

  return (
    <div>
      <p className="text-muted text-sm mb-6">Review and manage client projects</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              filter === opt.value
                ? "bg-[#0c0a09] text-[#fafafa] border-[#0c0a09]"
                : "border-hairline text-ink hover:bg-canvas"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm">No projects in this category</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Link
              key={project._id}
              href={`/admin/projects/${project._id}`}
              className="block bg-white border border-hairline p-5 hover:bg-canvas transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-display text-ink">{project.name}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{project.description}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                    statusColors[project.status] || "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {project.status.replace(/-/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-soft mt-3">
                <span>{project.user?.name || "Unknown"}</span>
                <span className="capitalize">{project.category}</span>
                <span className="capitalize">{project.priority}</span>
                {project.quotedCost > 0 && (
                  <span className="flex items-center gap-1 text-[#15803d]">
                    <DollarSign className="w-3 h-3" />
                    {project.quotedCost.toLocaleString()} {project.quotedCostCurrency}
                  </span>
                )}
                {project.comments?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {project.comments.length}
                  </span>
                )}
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
