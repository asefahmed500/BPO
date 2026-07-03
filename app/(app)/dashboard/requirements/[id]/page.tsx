"use client";

import { useState, useEffect, use } from "react";
import { getRequirement } from "@/lib/actions/requirement-actions";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  reviewing: "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequirement(id)
      .then(setReq)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-muted text-sm">Loading...</div>;
  }

  if (!req) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-sm mb-4">Requirement not found</p>
        <Link
          href="/dashboard/requirements"
          className="text-sm text-ink underline underline-offset-2"
        >
          Back to requirements
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/requirements"
        className="text-xs text-muted hover:text-ink transition-colors mb-6 inline-block"
      >
        &larr; Back to requirements
      </Link>

      <div className="bg-white rounded-2xl border border-hairline p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-display font-light text-ink">{req.title}</h1>
            <p className="text-xs text-muted mt-1">{req.category}</p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              statusColors[req.status] || "bg-gray-50 text-gray-700"
            }`}
          >
            {req.status}
          </span>
        </div>

        <div className="py-4 border-t border-hairline">
          <p className="text-sm text-body whitespace-pre-wrap">{req.description}</p>
        </div>

        <div className="pt-4 border-t border-hairline space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Submitted</span>
            <span className="text-ink">{new Date(req.createdAt).toLocaleDateString()}</span>
          </div>
          {req.adminNotes && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Admin notes</span>
              <span className="text-ink text-right max-w-[60%]">{req.adminNotes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
