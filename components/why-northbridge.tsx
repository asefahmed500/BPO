"use client";

import { ScrollReveal, StaggerItem } from "@/components/scroll-reveal";

const reasons = [
  {
    title: "24/7 multilingual coverage",
    description: "Follow-the-sun support across 14 countries in more than 20 languages.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" /><path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
      </svg>
    ),
  },
  {
    title: "Elastic workforce",
    description: "Ramp from 10 to 500 seats in weeks to match seasonal demand.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "40&ndash;60% cost savings",
    description: "Enterprise quality at a fraction of onshore operating cost.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "QA framework",
    description: "Calibrated scorecards, weekly coaching and transparent reporting.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Data security &amp; compliance",
    description: "SOC 2, ISO 27001 and PCI-DSS controls audited annually.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Fast time-to-value",
    description: "Pilot live in 4&ndash;6 weeks with structured onboarding and training.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function WhyNorthbridge() {
  return (
    <section className="flex flex-col bg-[#f5f5f5] px-5 md:px-20 py-16 md:py-24 gap-10">
      <ScrollReveal>
        <div className="max-w-[620px] flex flex-col gap-3">
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Why Northbridge</span>
          <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
            The reliability of an in-house team, without the overhead
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {reasons.map((reason, i) => (
          <StaggerItem key={reason.title} index={i}>
            <div className="group flex items-start bg-white border border-[#e7e5e4] rounded-2xl p-5 gap-4 transition-all duration-300 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="size-11 flex shrink-0 justify-center items-center bg-[#f0efed] rounded-full transition-transform duration-300 group-hover:scale-110">
                {reason.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[#0c0a09] text-[16px] font-medium leading-[1.35]" dangerouslySetInnerHTML={{ __html: reason.title }} />
                <p className="text-[#4e4e4e] text-[14px] leading-[1.5]" style={{ letterSpacing: "0.15px" }} dangerouslySetInnerHTML={{ __html: reason.description }} />
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
