"use client";

import { useState, useEffect, use } from "react";
import {
  getProject,
  reviewProject,
  addProjectComment,
} from "@/lib/actions/project-actions";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Check,
  X,
  DollarSign,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";

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

export default function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [quotedCost, setQuotedCost] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [comment, setComment] = useState("");
  const [action, setAction] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await getProject(id);
      setProject(data);
      setFeedback(data.feedback || "");
      setQuotedCost(String(data.quotedCost || 0));
      setCurrency(data.quotedCostCurrency || "USD");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleReview = async (status: "under-review" | "approved" | "needs-revision" | "rejected" | "active") => {
    setSubmitting(true);
    setAction(status);
    try {
      await reviewProject({
        projectId: id,
        status,
        feedback,
        quotedCost: Number(quotedCost),
        quotedCostCurrency: currency,
      });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
      setAction("");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await addProjectComment(id, comment);
      setComment("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted text-sm">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-sm">Project not found</p>
        <Link href="/admin/projects" className="text-sm text-ink underline underline-offset-2 mt-4 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/projects"
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
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {project.userId ? "Client" : "Unknown"}
              </span>
              <span className="capitalize">{project.category}</span>
              <span className="capitalize">{project.priority} priority</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] || "bg-[#f3f4f6] text-[#6b7280]"}`}>
            {project.status.replace(/-/g, " ")}
          </span>
        </div>
        <p className="text-sm text-body whitespace-pre-wrap pt-4 border-t border-hairline">{project.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-hairline">
          <div>
            <p className="text-xs text-muted mb-1">Client Budget</p>
            <p className="text-ink">${(project.budget || 0).toLocaleString()}</p>
          </div>
          {project.deadline && (
            <div>
              <p className="text-xs text-muted mb-1">Deadline</p>
              <p className="text-ink">{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Panel */}
      <div className="bg-white border border-hairline p-5 mb-6">
        <h3 className="text-sm font-display text-ink mb-4">Review Actions</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-body-strong mb-1.5">Feedback / Notes</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink resize-none"
              placeholder="Provide feedback to the client..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body-strong mb-1.5">Quoted Cost</label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted" />
                <input
                  type="number"
                  value={quotedCost}
                  onChange={(e) => setQuotedCost(e.target.value)}
                  min="0"
                  className="flex-1 px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="BDT">BDT</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline">
            {project.status !== "approved" && project.status !== "active" && (
              <button
                onClick={() => handleReview("approved")}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#22c55e] text-white text-sm font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {action === "approved" ? "Approving..." : "Approve"}
              </button>
            )}
            <button
              onClick={() => handleReview("needs-revision")}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#f59e0b] text-white text-sm font-medium hover:bg-[#d97706] transition-colors disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4" />
              Request Revision
            </button>
            <button
              onClick={() => handleReview("rejected")}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ef4444] text-white text-sm font-medium hover:bg-[#dc2626] transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => handleReview("under-review")}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 border border-hairline text-sm text-ink hover:bg-canvas transition-colors disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              Mark Under Review
            </button>
            {project.status === "approved" && (
              <button
                onClick={() => handleReview("active")}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0c0a09] text-[#fafafa] text-sm font-medium hover:bg-[#292524] transition-colors disabled:opacity-50"
              >
                Start Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Existing Feedback */}
      {project.feedback && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-4 mb-6">
          <p className="text-xs text-[#92400e] font-medium mb-1">Previous Feedback</p>
          <p className="text-sm text-ink whitespace-pre-wrap">{project.feedback}</p>
        </div>
      )}

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
                className={`flex gap-3 ${c.authorRole === "admin" ? "flex-row-reverse text-right" : "flex-row"}`}
              >
                <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-[#fafafa] flex items-center justify-center text-xs font-medium shrink-0">
                  {c.authorName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className={`inline-block px-3 py-2 text-sm ${
                    c.authorRole === "admin"
                      ? "bg-[#eff6ff] text-ink"
                      : "bg-[#f3f4f6] text-ink"
                  }`}>
                    <p className="text-xs text-muted mb-1">
                      {c.authorName} {c.authorRole === "admin" ? "(Admin)" : "(Client)"}
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
          <p className="text-xs text-muted-soft mb-4">No messages yet</p>
        )}

        <form onSubmit={handleComment} className="flex items-center gap-2 pt-3 border-t border-hairline">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Reply to client..."
            className="flex-1 px-3 py-2 bg-canvas border border-hairline text-sm text-ink focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="p-2 bg-[#0c0a09] text-[#fafafa] hover:bg-[#292524] transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
