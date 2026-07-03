"use client";

import { useState, useEffect, use } from "react";
import {
  getProject,
  createTask,
  updateTaskStatus,
  deleteTask,
  updateProject,
  addProjectComment,
} from "@/lib/actions/project-actions";
import Link from "next/link";
import { MessageSquare, Send, Edit3, X, Check, Clock, DollarSign } from "lucide-react";

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

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editPriority, setEditPriority] = useState("medium");
  const [editBudget, setEditBudget] = useState("0");
  const [editDeadline, setEditDeadline] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const load = async () => {
    try {
      const data = await getProject(id);
      setProject(data);
      setEditName(data.name);
      setEditDescription(data.description);
      setEditCategory(data.category);
      setEditPriority(data.priority);
      setEditBudget(String(data.budget || 0));
      setEditDeadline(data.deadline ? new Date(data.deadline).toISOString().slice(0, 10) : "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      await updateProject({
        projectId: id,
        name: editName,
        description: editDescription,
        category: editCategory,
        priority: editPriority as "low" | "medium" | "high" | "urgent",
        budget: Number(editBudget),
        deadline: editDeadline || undefined,
        tags: [],
      });
      setEditing(false);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await addProjectComment(id, comment);
      setComment("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted text-sm">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-sm">Project not found</p>
        <Link href="/dashboard/projects" className="text-sm text-ink underline underline-offset-2 mt-4 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  const canEdit = project.status === "submitted" || project.status === "needs-revision" || project.status === "rejected";

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/projects"
        className="text-xs text-muted hover:text-ink transition-colors mb-6 inline-block"
      >
        &larr; Back to projects
      </Link>

      {/* Project Header */}
      <div className="bg-white border border-hairline p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-display text-ink mb-1">{project.name}</h1>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="capitalize">{project.category}</span>
              <span className="capitalize">{project.priority} priority</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] || "bg-[#f3f4f6] text-[#6b7280]"}`}>
              {project.status.replace(/-/g, " ")}
            </span>
            {canEdit && (
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1 text-xs text-ink hover:text-muted transition-colors px-2 py-1 border border-hairline"
              >
                {editing ? <X className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                {editing ? "Cancel" : "Edit"}
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleEdit} className="space-y-4 pt-4 border-t border-hairline">
            <div>
              <label className="block text-sm text-body-strong mb-1">Project Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-body-strong mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
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
                <label className="block text-sm text-body-strong mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-body-strong mb-1">Budget</label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submittingEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0c0a09] text-[#fafafa] text-sm font-medium hover:bg-[#292524] transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {submittingEdit ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-body whitespace-pre-wrap pt-4 border-t border-hairline">{project.description}</p>
        )}
      </div>

      {/* Admin Feedback */}
      {project.feedback && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-[#b45309]" />
            <h3 className="text-sm font-medium text-[#92400e]">Admin Feedback</h3>
          </div>
          <p className="text-sm text-ink whitespace-pre-wrap">{project.feedback}</p>
        </div>
      )}

      {/* Quoted Cost */}
      {project.quotedCost > 0 && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#15803d]" />
            <h3 className="text-sm font-medium text-[#15803d]">Quoted Cost</h3>
          </div>
          <p className="text-2xl font-display text-ink">
            ${project.quotedCost.toLocaleString()} {project.quotedCostCurrency}
          </p>
        </div>
      )}

      {/* Project Info */}
      <div className="bg-white border border-hairline p-5 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted mb-1">Submitted</p>
            <p className="text-ink">{new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          {project.deadline && (
            <div>
              <p className="text-xs text-muted mb-1">Deadline</p>
              <p className="text-ink">{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
          )}
          {project.budget > 0 && (
            <div>
              <p className="text-xs text-muted mb-1">Your Budget</p>
              <p className="text-ink">${project.budget.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Thread */}
      <div className="bg-white border border-hairline p-5 mb-6">
        <h3 className="text-sm font-display text-ink mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted" />
          Discussion ({project.comments?.length || 0})
        </h3>

        {project.comments && project.comments.length > 0 ? (
          <div className="space-y-3 mb-4">
            {project.comments.map((c: any, i: number) => (
              <div
                key={i}
                className={`flex gap-3 ${c.authorRole === "admin" ? "flex-row" : "flex-row-reverse text-right"}`}
              >
                <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-[#fafafa] flex items-center justify-center text-xs font-medium shrink-0">
                  {c.authorName?.charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 max-w-[80%]`}>
                  <div className={`inline-block px-3 py-2 text-sm ${
                    c.authorRole === "admin"
                      ? "bg-[#eff6ff] text-ink text-left"
                      : "bg-[#f3f4f6] text-ink"
                  }`}>
                    <p className="text-xs text-muted mb-1">
                      {c.authorName} {c.authorRole === "admin" && "(Admin)"}
                    </p>
                    <p>{c.content}</p>
                  </div>
                  <p className="text-xs text-muted-soft mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-soft mb-4">No messages yet. Start the conversation below.</p>
        )}

        <form onSubmit={handleComment} className="flex items-center gap-2 pt-3 border-t border-hairline">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={submittingComment || !comment.trim()}
            className="p-2 bg-[#0c0a09] text-[#fafafa] hover:bg-[#292524] transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Tasks (only if project is approved/active) */}
      {(project.status === "approved" || project.status === "active" || project.status === "completed") && (
        <div>
          <h3 className="text-sm font-display text-ink mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted" />
            Tasks ({project.tasks?.length || 0})
          </h3>
          {project.tasks && project.tasks.length > 0 ? (
            <div className="space-y-2">
              {project.tasks.map((task: any) => (
                <div key={task._id} className="bg-white border border-hairline p-4 flex items-center gap-3">
                  <span className={`text-sm ${task.status === "done" ? "line-through text-muted" : "text-ink"}`}>
                    {task.title}
                  </span>
                  <span className="text-xs text-muted ml-auto">{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-soft">No tasks yet</p>
          )}
        </div>
      )}
    </div>
  );
}
