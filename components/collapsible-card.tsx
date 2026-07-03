"use client";

import { useState } from "react";

interface CollapsibleCardProps {
  title: string;
  badge?: string | number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleCard({
  title,
  badge,
  defaultOpen = true,
  children,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-hairline">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-canvas transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{title}</span>
          {badge !== undefined && badge !== null && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-medium text-muted bg-canvas border border-hairline">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-hairline pt-4">{children}</div>
      )}
    </div>
  );
}
