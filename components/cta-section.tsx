"use client";

import Link from "next/link";

export function CtaSection() {
  return (
    <section className="flex flex-col items-center bg-[#1c1917] px-5 md:px-20 py-24 md:py-32 gap-6 text-center overflow-clip relative">
      <div className="size-[450px] absolute top-[-200px] right-[-100px] bg-[radial-gradient(circle,_#a7e5d3_0%,_transparent_70%)] rounded-full pointer-events-none opacity-20" />
      <div className="size-[400px] absolute bottom-[-160px] left-[-100px] bg-[radial-gradient(circle,_#c8b8e0_0%,_transparent_70%)] rounded-full pointer-events-none opacity-20" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-[640px]">
        <span className="text-[#a8a29e] text-[12px] font-semibold tracking-[0.96px] uppercase">Get started</span>
        <h2 className="text-[#fafafa] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.44px]">
          Ready to transform your customer operations?
        </h2>
        <p className="text-[#a8a29e] text-[16px] leading-[1.6] max-w-[480px]" style={{ letterSpacing: "0.16px" }}>
          Tell us about your operation and we&rsquo;ll design a proposal around your specific metrics, SLAs and budget.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/contact"
            className="flex h-[44px] items-center bg-white rounded-full px-6 text-[#0c0a09] text-[15px] font-medium leading-none transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Schedule a call
          </Link>
          <Link
            href="/services"
            className="flex h-[44px] items-center border rounded-full px-6 text-white text-[15px] font-medium leading-none border-[#57534e] transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Our services
          </Link>
        </div>
      </div>
    </section>
  );
}
