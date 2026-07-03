"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "12,400+", label: "Agents deployed globally" },
  { value: "9", label: "Delivery centers" },
  { value: "14", label: "Countries served" },
  { value: "96.2%", label: "Customer satisfaction score" },
  { value: "99.95%", label: "Infrastructure uptime SLA" },
];

function CountUp({
  end,
  suffix = "",
  duration = 1000,
  enabled,
}: {
  end: string;
  suffix?: string;
  duration?: number;
  enabled: boolean;
}) {
  const numeric = parseFloat(end.replace(/[,+%]/g, ""));
  const isDecimal = end.includes(".");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let startTime: number | null = null;
    let raf: number;

    function step(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(numeric * progress);
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [enabled, numeric, duration]);

  if (!enabled) return <>{end}</>;
  return <>{isDecimal ? count.toFixed(2).replace(/\.?0+$/, "") + suffix : Math.floor(count).toLocaleString() + suffix}</>;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          o.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="flex flex-col bg-[#fafafa] px-5 md:px-20 py-16 md:py-24 gap-10"
    >
      <div className="max-w-[620px] flex flex-col gap-3">
        <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">By the numbers</span>
        <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
          Scale that speaks for itself
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col bg-white border border-[#e7e5e4] rounded-2xl p-5 gap-1.5 transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <span className="text-[#0c0a09] text-[28px] md:text-[32px] font-light leading-[1.13] tracking-[-0.32px]">
              <CountUp end={stat.value} enabled={visible} />
            </span>
            <span className="text-[#777169] text-[14px] leading-[1.5]" style={{ letterSpacing: "0.15px" }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
