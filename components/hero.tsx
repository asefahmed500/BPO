"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="flex relative min-h-[560px] md:min-h-[calc(100vh-80px)] items-center justify-center bg-[#f5f5f5] px-5 md:px-20 -mt-[80px] pt-[80px] overflow-clip">
      {/* Animated gradient mesh background */}
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

      <div className="flex relative z-10 flex-col items-center text-center gap-6 max-w-[780px] py-20 md:py-24">
        <div
          className={`flex items-center gap-2 transition-all duration-[400ms] ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-3 py-[5px] gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-[#292524] text-[12px] font-semibold tracking-[0.96px] uppercase">SOC 2 &middot; ISO 27001 &middot; PCI-DSS</span>
          </div>
        </div>

        <h1
          className={`text-[#0c0a09] text-[44px] md:text-[72px] lg:text-[80px] font-light leading-[1.02] tracking-[-2.4px] transition-all duration-[400ms] ease-out delay-[40ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          Scale your customer experience.<br />Not your headcount.
        </h1>

        <p
          className={`text-[#4e4e4e] text-[17px] md:text-[18px] leading-[1.6] max-w-[520px] transition-all duration-[400ms] ease-out delay-[80ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ letterSpacing: "0.18px" }}
        >
          Enterprise-grade business process outsourcing across 9 delivery centers at a fraction of the cost.
        </p>

        <div
          className={`flex flex-wrap items-center justify-center gap-3 pt-2 transition-all duration-[400ms] ease-out delay-[120ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Link
            href="/contact"
            className="flex h-[44px] items-center bg-[#292524] rounded-full px-6 text-white text-[15px] font-medium leading-none transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Request a Quote
          </Link>
          <Link
            href="/services"
            className="flex h-[44px] items-center border rounded-full px-6 text-[#0c0a09] text-[15px] font-medium leading-none border-[#d6d3d1] transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
}
