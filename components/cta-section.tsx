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
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export function CtaSection() {
  return (
    <section className="flex flex-col items-center bg-[#1c1917] px-5 md:px-20 py-24 md:py-32 gap-6 text-center overflow-clip relative">
      <div className="size-[450px] absolute top-[-200px] right-[-100px] bg-[radial-gradient(circle,_#a7e5d3_0%,_transparent_70%)] rounded-full pointer-events-none opacity-20" />
      <div className="size-[400px] absolute bottom-[-160px] left-[-100px] bg-[radial-gradient(circle,_#c8b8e0_0%,_transparent_70%)] rounded-full pointer-events-none opacity-20" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-[640px]"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.span variants={item} className="text-[#a8a29e] text-[12px] font-semibold tracking-[0.96px] uppercase">Get started</motion.span>
        <motion.h2 variants={item} className="text-[#fafafa] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.44px]">
          Ready to transform your customer operations?
        </motion.h2>
        <motion.p variants={item} className="text-[#a8a29e] text-[16px] leading-[1.6] max-w-[480px]" style={{ letterSpacing: "0.16px" }}>
          Tell us about your operation and we&rsquo;ll design a proposal around your specific metrics, SLAs and budget.
        </motion.p>
        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
            <Link
              href="/contact"
              className="flex h-[44px] items-center bg-white rounded-full px-6 text-[#0c0a09] text-[15px] font-medium leading-none"
            >
              Schedule a call
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
            <Link
              href="/services"
              className="flex h-[44px] items-center border rounded-full px-6 text-white text-[15px] font-medium leading-none border-[#57534e]"
            >
              Our services
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
