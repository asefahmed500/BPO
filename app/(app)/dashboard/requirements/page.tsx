"use client";

import { useState, useEffect } from "react";
import {
  getRequirements,
  createRequirement,
} from "@/lib/actions/requirement-actions";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  reviewing: "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");

  const load = async () => {
    try {
      setRequirements(await getRequirements());
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
    try {
      await createRequirement({
        title,
        description,
        category: category as "general" | "software" | "hardware" | "services" | "consulting" | "support" | "other",
        priority: "medium",
        budget: 0,
        currency: "USD",
        tags: [],
      });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCategory("general");
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted text-sm">Submit and track your requirements</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
        >
          {showForm ? "Cancel" : "New Requirement"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-hairline p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-body-strong mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              placeholder="What do you need?"
            />
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
            >
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="feature">Feature Request</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink resize-none"
              placeholder="Describe your requirement in detail..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Submit Requirement
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : requirements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No requirements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((req: any) => (
            <Link
              key={req._id}
              href={`/dashboard/requirements/${req._id}`}
              className="block bg-white rounded-2xl border border-hairline p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-display font-light text-ink">
                  {req.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    statusColors[req.status] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-muted line-clamp-2">{req.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-muted-soft">{req.category}</span>
                <span className="text-xs text-muted-soft">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
