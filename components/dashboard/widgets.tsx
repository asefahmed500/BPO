"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, staggerItem, viewportOnce } from "@/lib/motion-presets";

const tones: Record<string, { bg: string; fg: string }> = {
  mint: { bg: "bg-[#eaf7f2]", fg: "text-[#1f7a66]" },
  lavender: { bg: "bg-[#f1ecf7]", fg: "text-[#5e4b8b]" },
  peach: { bg: "bg-[#fbede3]", fg: "text-[#9c5a2f]" },
  sky: { bg: "bg-[#eaf1f8]", fg: "text-[#2f5a86]" },
  ink: { bg: "bg-[#f0efed]", fg: "text-[#292524]" },
};

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-[26px] font-display font-light text-ink tracking-[-0.4px]">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 flex h-10 items-center bg-ink text-on-primary rounded-full px-5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "ink",
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: keyof typeof tones;
  loading?: boolean;
}) {
  const t = tones[tone] ?? tones.ink;
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="flex flex-col bg-white border border-hairline rounded-2xl p-5 gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted text-[11px] font-semibold tracking-[0.4px] uppercase">{label}</span>
        <div className={`size-9 flex items-center justify-center rounded-xl ${t.bg}`}>
          <Icon className={`w-4 h-4 ${t.fg}`} strokeWidth={1.75} />
        </div>
      </div>
      <span className="text-ink text-[28px] font-display font-light leading-none tracking-[-0.4px]">
        {loading ? "…" : value}
      </span>
      {sub && <span className="text-muted text-[12px]">{sub}</span>}
    </motion.div>
  );
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }}
    >
      {children}
    </motion.div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={`flex flex-col bg-white border border-hairline rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-display font-medium text-ink">{title}</h2>
        {action && (
          <Link href={action.href} className="flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-ink">
            {action.label}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </motion.div>
  );
}

export function BarChart({ data, totalLabel }: { data: { label: string; value: number }[]; totalLabel?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2 h-[120px]">
        {data.map((d, i) => (
          <div key={d.label} className="flex flex-col items-center justify-end gap-1.5 flex-1 h-full">
            <span className="text-[11px] font-medium text-ink">{d.value}</span>
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.06 }}
              style={{ height: `${(d.value / max) * 100}%`, transformOrigin: "bottom" }}
              className="w-full max-w-[32px] bg-ink rounded-sm"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] leading-tight text-muted truncate">
            {d.label}
          </span>
        ))}
      </div>
      {totalLabel && (
        <span className="text-muted text-[11px] border-t border-hairline-soft pt-3">
          {total} {totalLabel}
        </span>
      )}
    </div>
  );
}

export function ActivityList({
  items,
  emptyText = "Nothing yet",
}: {
  items: { text: ReactNode; time?: string; tone?: "mint" | "peach" | "lavender" }[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3">
          <span
            className={`size-2 rounded-full mt-[5px] shrink-0 ${
              it.tone === "mint" ? "bg-[#a7e5d3]" : it.tone === "peach" ? "bg-[#f4c5a8]" : "bg-[#c8b8e0]"
            }`}
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] text-ink leading-snug">{it.text}</span>
            {it.time && <span className="text-[11px] text-muted">{it.time}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickActionRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 rounded-xl border border-hairline text-sm text-body transition-colors hover:border-ink hover:text-ink"
    >
      {label}
      <ArrowUpRight className="w-4 h-4 text-muted" />
    </Link>
  );
}
