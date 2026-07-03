"use client";

import { useState, useEffect } from "react";
import { getProjects } from "@/lib/actions/project-actions";
import Link from "next/link";

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  "on-hold": "bg-yellow-50 text-yellow-700",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="text-muted text-sm mb-8">View your projects and tasks</p>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any) => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="block bg-white rounded-2xl border border-hairline p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <h3 className="text-sm font-display font-light text-ink">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{project.description}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    statusColors[project.status] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span>
                  {project.completedTasks || 0}/{project.taskCount || 0} tasks
                </span>
                {project.taskCount > 0 && (
                  <div className="flex-1 max-w-[200px] bg-canvas rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{
                        width: `${Math.round(
                          ((project.completedTasks || 0) / (project.taskCount || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
