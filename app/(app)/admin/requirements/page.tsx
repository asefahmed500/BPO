"use client";

import { useState, useEffect } from "react";
import {
  getAllRequirements,
  reviewRequirement,
} from "@/lib/actions/requirement-actions";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  reviewing: "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function AdminRequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    try {
      setRequirements(await getAllRequirements());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await reviewRequirement({ requirementId: id, status, adminNotes: notes });
      setReviewingId(null);
      setNotes("");
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <p className="text-muted text-sm mb-8">Review user requirements</p>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : requirements.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm">No requirements</div>
      ) : (
        <div className="space-y-3">
          {requirements.map((req: any) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-hairline p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-display font-light text-ink">
                    {req.title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    by {req.user?.name || "Unknown"} ({req.user?.email || "?"})
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    statusColors[req.status] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-body mb-3">{req.description}</p>

              {req.status === "pending" && (
                <div className="space-y-2">
                  <textarea
                    placeholder="Add notes (optional)"
                    value={reviewingId === req._id ? notes : ""}
                    onChange={(e) => {
                      setReviewingId(req._id);
                      setNotes(e.target.value);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-xs text-ink focus:outline-none focus:border-ink resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(req._id, "approved")}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(req._id, "rejected")}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {req.adminNotes && (
                <div className="mt-3 pt-3 border-t border-hairline">
                  <p className="text-xs text-muted-soft">Admin notes: {req.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
