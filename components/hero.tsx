"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion-presets";
import type { Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const float = (duration: number, delay: number) => ({
  animate: { y: [0, -8, 0] },
  transition: { duration, repeat: Infinity, ease: "easeInOut" as const, delay },
});

export function Hero() {
  return (
    <section className="relative flex min-h-[640px] md:min-h-[calc(100vh-80px)] items-center justify-center bg-[#f5f5f5] px-5 md:px-20 -mt-[80px] pt-[80px] overflow-clip">
      {/* Base drifting gradient mesh */}
      <div
        className="absolute inset-0 animate-mesh-drift pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(800px circle at 20% 30%, rgba(167,229,211,0.35), transparent 70%),
            radial-gradient(700px circle at 70% 20%, rgba(200,184,224,0.3), transparent 70%),
            radial-gradient(600px circle at 50% 80%, rgba(244,197,168,0.3), transparent 70%)
          `,
        }}
      />

      {/* Floating blurred orbs */}
      <div
        className="absolute -top-24 -left-16 size-[380px] rounded-full bg-[#a7e5d3] opacity-40 blur-3xl animate-orb-drift pointer-events-none"
        style={{ animationDuration: "18s", animationDelay: "-3s" }}
      />
      <div
        className="absolute -top-10 right-[-60px] size-[340px] rounded-full bg-[#c8b8e0] opacity-35 blur-3xl animate-orb-drift pointer-events-none"
        style={{ animationDuration: "22s", animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-[-90px] left-1/3 size-[360px] rounded-full bg-[#f4c5a8] opacity-30 blur-3xl animate-orb-drift pointer-events-none"
        style={{ animationDuration: "20s", animationDelay: "-11s" }}
      />

      {/* Soft spotlight behind the copy */}
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 size-[680px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_62%)]" />

      {/* Bottom fade into the next section */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-[#f5f5f5] pointer-events-none" />

      {/* ---------- Floating UI cards (desktop only) ---------- */}

      {/* Top-left: CSAT */}
      <motion.div
        className="absolute top-[16%] left-[4%] hidden lg:block z-[5]"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.6 }}
      >
        <motion.div {...float(6, 0.2)}>
          <div className="flex flex-col bg-white/70 backdrop-blur-md border border-white/70 rounded-2xl p-4 gap-1.5 w-[172px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-[#777169] text-[11px] font-semibold tracking-[0.4px] uppercase">CSAT Score</span>
              <span className="size-1.5 rounded-full bg-[#3fae7f]" />
            </div>
            <span className="text-[#0c0a09] text-[28px] font-light leading-none tracking-[-0.4px]">94.2%</span>
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f7a66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              <span className="text-[#1f7a66] text-[11px] font-medium">+2.1% this quarter</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Top-right: Live agents */}
      <motion.div
        className="absolute top-[12%] right-[5%] hidden lg:block z-[5]"
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.75 }}
      >
        <motion.div {...float(7, 1.1)}>
          <div className="flex flex-col bg-white/70 backdrop-blur-md border border-white/70 rounded-2xl p-4 gap-2 w-[196px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-[#777169] text-[11px] font-semibold tracking-[0.4px] uppercase">Available agents</span>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-[#3fae7f] opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-[#3fae7f]" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[
                  { bg: "#a7e5d3", t: "AK" },
                  { bg: "#c8b8e0", t: "MJ" },
                  { bg: "#f4c5a8", t: "RS" },
                  { bg: "#a8c8e8", t: "TD" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className="size-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#0c0a09] border-2 border-white"
                    style={{ backgroundColor: a.bg, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {a.t}
                  </div>
                ))}
                <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#292524] bg-[#f0efed] border-2 border-white" style={{ marginLeft: -8 }}>
                  +43
                </div>
              </div>
            </div>
            <span className="text-[#0c0a09] text-[13px] font-medium leading-none">847 online now</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom-left: Response time */}
      <motion.div
        className="absolute bottom-[24%] left-[7%] hidden lg:block z-[5]"
        initial={{ opacity: 0, x: -28, y: 12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.9 }}
      >
        <motion.div {...float(6.5, 0.6)}>
          <div className="flex items-center bg-white/70 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 gap-3 w-[180px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="size-9 flex justify-center items-center bg-[#f0efed] rounded-xl shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#777169] text-[11px] font-medium tracking-[0.3px] uppercase">Avg response</span>
              <span className="text-[#0c0a09] text-[20px] font-light leading-none tracking-[-0.3px]">2.4 min</span>
              <span className="text-[#1f7a66] text-[11px] font-medium">18% faster</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom-right: Ticket volume sparkline */}
      <motion.div
        className="absolute bottom-[14%] right-[4%] hidden lg:block z-[5]"
        initial={{ opacity: 0, x: 28, y: 12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.05 }}
      >
        <motion.div {...float(7.5, 1.8)}>
          <div className="flex flex-col bg-white/70 backdrop-blur-md border border-white/70 rounded-2xl p-4 gap-2 w-[200px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-[#777169] text-[11px] font-semibold tracking-[0.4px] uppercase">Tickets / week</span>
              <span className="text-[#a7e5d3] text-[11px] font-semibold">+8.3%</span>
            </div>
            <div className="flex items-end justify-between h-[44px] gap-1.5">
              {[67, 80, 88, 75, 100, 85, 72].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, backgroundColor: h === 100 ? "#1f7a66" : "#292524", opacity: h === 100 ? 1 : 0.85 }}
                />
              ))}
            </div>
            <span className="text-[#0c0a09] text-[18px] font-light leading-none tracking-[-0.3px]">11,440 <span className="text-[#777169] text-[12px] font-normal">handled</span></span>
          </div>
        </motion.div>
      </motion.div>

      {/* ---------- Centered copy ---------- */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center gap-6 max-w-[1000px] py-24 md:py-28"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item} className="flex items-center">
          <div className="flex items-center bg-white/70 backdrop-blur-md rounded-full pl-2.5 pr-3.5 py-1.5 gap-2 border border-white/60 shadow-[0_1px_10px_rgba(0,0,0,0.04)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-[#3fae7f] opacity-75 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-[#3fae7f]" />
            </span>
            <span className="text-[#292524] text-[12px] font-semibold tracking-[0.96px] uppercase">SOC 2 &middot; ISO 27001 &middot; PCI-DSS</span>
          </div>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-[#0c0a09] text-[36px] sm:text-[46px] md:text-[58px] lg:text-[68px] font-light leading-[1.06] tracking-[-1px] md:tracking-[-1.5px] lg:tracking-[-2px] text-balance"
        >
          Scale your <em className="italic font-normal text-[#1f7a66]">customer experience</em>.<br />Not your headcount.
        </motion.h1>

        <motion.p
          variants={item}
          className="text-[#4e4e4e] text-[17px] md:text-[19px] leading-[1.6] max-w-[540px]"
          style={{ letterSpacing: "0.18px" }}
        >
          Enterprise-grade business process outsourcing across 9 delivery centers at a fraction of the cost.
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
            <Link
              href="/contact"
              className="flex h-[44px] items-center bg-[#292524] rounded-full px-6 text-white text-[15px] font-medium leading-none shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
            >
              Request a Quote
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
            <Link
              href="/services"
              className="flex h-[44px] items-center bg-white/70 backdrop-blur-sm border rounded-full px-6 text-[#0c0a09] text-[15px] font-medium leading-none border-[#d6d3d1]"
            >
              Explore Services
            </Link>
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-3 text-[#777169] text-[13px] font-medium">
          <span>9 delivery centers</span>
          <span className="text-[#d6d3d1]">&middot;</span>
          <span>20+ languages</span>
          <span className="text-[#d6d3d1]">&middot;</span>
          <span>24/7 coverage</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
