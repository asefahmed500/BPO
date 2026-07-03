import type { Metadata } from "next";
import { StatsSection } from "@/components/stats-section";
import { WhyNorthbridge } from "@/components/why-northbridge";
import { CtaSection } from "@/components/cta-section";

export const metadata: Metadata = {
  title: "About Us | Northbridge BPO",
  description: "18 years of enterprise BPO excellence. 12,400+ agents across 9 delivery centers in 14 countries.",
};

export default function AboutPage() {
  return (
    <>
      <section className="flex relative min-h-[360px] items-center justify-center bg-[#f5f5f5] px-5 md:px-20 py-20 md:py-28 overflow-clip">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(600px circle at 20% 30%, rgba(167,229,211,0.3), transparent 70%),
              radial-gradient(500px circle at 80% 40%, rgba(200,184,224,0.25), transparent 70%),
              radial-gradient(400px circle at 50% 70%, rgba(244,197,168,0.25), transparent 70%)
            `,
          }}
        />
        <div className="flex relative z-10 flex-col items-center text-center gap-5 max-w-[620px]">
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">About Us</span>
          <h1 className="text-[#0c0a09] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.2px]">
            Built for scale. Driven by quality.
          </h1>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.6] max-w-[520px]" style={{ letterSpacing: "0.16px" }}>
            Northbridge BPO was founded to give fast-growing companies the operational muscle of a global enterprise &mdash;
            without the overhead. Today we operate across 9 delivery centers spanning 14 countries.
          </p>
        </div>
      </section>

      <StatsSection />

      <section className="bg-[#fafafa] px-5 md:px-20 py-16 md:py-24">
        <div className="max-w-[860px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-[#0c0a09] text-[28px] font-light leading-[1.13] tracking-[-0.32px]">Our mission</h2>
            <p className="text-[#4e4e4e] text-[15px] leading-[1.6]" style={{ letterSpacing: "0.15px" }}>
              To make world-class operational talent accessible to every company, regardless of size or location.
              We believe geography should never limit the quality of service a business can deliver to its customers.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-[#0c0a09] text-[28px] font-light leading-[1.13] tracking-[-0.32px]">Our approach</h2>
            <p className="text-[#4e4e4e] text-[15px] leading-[1.6]" style={{ letterSpacing: "0.15px" }}>
              We don&rsquo;t just fill seats. Every engagement starts with a detailed process audit, custom training
              curriculum and a dedicated quality assurance framework that mirrors &mdash; and often improves upon &mdash;
              your in-house standards.
            </p>
          </div>
        </div>
      </section>

      <WhyNorthbridge />
      <CtaSection />
    </>
  );
}
