import type { Metadata } from "next";
import Link from "next/link";
import { CtaSection } from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Careers | Northbridge BPO",
  description: "Join 12,400+ professionals across 9 global delivery centers. Explore career opportunities at Northbridge BPO.",
};

const benefits = [
  {
    title: "Global opportunities",
    description: "Work across 9 delivery centers in 14 countries with potential for international rotation.",
  },
  {
    title: "Continuous learning",
    description: "Access to certifications, language training and leadership development programs.",
  },
  {
    title: "Competitive compensation",
    description: "Industry-leading salaries, performance bonuses and comprehensive health coverage.",
  },
  {
    title: "Growth trajectory",
    description: "70% of our team leads and managers were promoted from individual contributor roles.",
  },
];

export default function CareersPage() {
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
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Careers</span>
          <h1 className="text-[#0c0a09] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.2px]">
            Build your career with a global team
          </h1>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.6] max-w-[520px]" style={{ letterSpacing: "0.16px" }}>
            Join 12,400+ professionals delivering enterprise-grade outsourcing from 9 delivery centers worldwide.
          </p>
        </div>
      </section>

      <section className="bg-[#fafafa] px-5 md:px-20 py-16 md:py-24">
        <div className="max-w-[720px] mx-auto mb-14 text-center">
          <h2 className="text-[#0c0a09] text-[32px] font-light leading-[1.13] tracking-[-0.36px]">Why join Northbridge?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-[860px] mx-auto">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex flex-col bg-white border border-[#e7e5e4] rounded-2xl p-6 gap-3 transition-all duration-300 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <h3 className="text-[#0c0a09] text-[18px] font-medium leading-[1.35]" style={{ letterSpacing: "0.16px" }}>{b.title}</h3>
              <p className="text-[#4e4e4e] text-[15px] leading-[1.6]" style={{ letterSpacing: "0.15px" }}>{b.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/contact"
            className="flex h-[44px] items-center bg-[#292524] rounded-full px-6 gap-2 text-white text-[15px] font-medium leading-none transition-all duration-200 ease-out active:scale-[0.97]"
          >
            View Open Positions
          </Link>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
