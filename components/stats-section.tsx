"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { EASE_OUT, staggerContainer, staggerItem, viewportOnce } from "@/lib/motion-presets";

const stats = [
  { value: "12,400+", label: "Agents deployed globally" },
  { value: "9", label: "Delivery centers" },
  { value: "14", label: "Countries served" },
  { value: "96.2%", label: "Customer satisfaction score" },
  { value: "99.95%", label: "Infrastructure uptime SLA" },
];

function CountUp({ end, enabled, duration = 1.4 }: { end: string; enabled: boolean; duration?: number }) {
  const match = end.match(/^([\d.,]+)/);
  const numeric = match ? parseFloat(match[1].replace(/[,]/g, "")) : 0;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = end.replace(/^[\d.,]+/, "");
  const [count, setCount] = useState(enabled ? numeric : 0);

  useEffect(() => {
    if (!enabled) return;
    const controls = animate(0, numeric, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setCount(v),
    });
    return () => controls.stop();
  }, [enabled, numeric, duration]);

  const formatted =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.floor(count).toLocaleString();

  return <>{enabled ? `${formatted}${suffix}` : end}</>;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="flex flex-col bg-[#fafafa] px-5 md:px-20 py-16 md:py-24 gap-10">
      <motion.div
        className="max-w-[620px] flex flex-col gap-3"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">By the numbers</span>
        <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
          Scale that speaks for itself
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-5"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={{ ...staggerContainer, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="flex flex-col bg-white border border-[#e7e5e4] rounded-2xl p-5 gap-1.5"
          >
            <span className="text-[#0c0a09] text-[28px] md:text-[32px] font-light leading-[1.13] tracking-[-0.32px]">
              <CountUp end={stat.value} enabled={inView} />
            </span>
            <span className="text-[#777169] text-[14px] leading-[1.5]" style={{ letterSpacing: "0.15px" }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
