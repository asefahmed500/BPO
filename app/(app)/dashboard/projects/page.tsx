"use client";

import { useState, useEffect } from "react";
import { getProjects, createProject } from "@/lib/actions/project-actions";
import { Plus, X, MessageSquare } from "lucide-react";
import Link from "next/link";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [budget, setBudget] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProject({
        name,
        description,
        category,
        priority: priority as "low" | "medium" | "high" | "urgent",
        budget: Number(budget),
        deadline: deadline || undefined,
        tags: [],
      });
      setShowForm(false);
      setName("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
      setBudget("0");
      setDeadline("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted text-sm">Submit and track your projects</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0c0a09] text-[#fafafa] text-sm font-medium hover:bg-[#292524] transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Project"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-hairline p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-body-strong mb-1.5">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              placeholder="What do you want to build?"
            />
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink resize-none"
              placeholder="Describe your project requirements in detail..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              >
                <option value="general">General</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="services">Services</option>
                <option value="consulting">Consulting</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Budget (USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1.5">Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#0c0a09] text-[#fafafa] text-sm font-medium hover:bg-[#292524] transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No projects yet. Click "New Project" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
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
                <span className="capitalize">{project.category}</span>
                <span className="capitalize">{project.priority}</span>
                {project.quotedCost > 0 && (
                  <span className="text-[#15803d]">
                    Quoted: ${project.quotedCost.toLocaleString()} {project.quotedCostCurrency}
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
