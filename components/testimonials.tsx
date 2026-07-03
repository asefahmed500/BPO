"use client";

import { ScrollReveal, StaggerItem } from "@/components/scroll-reveal";

const testimonials = [
  {
    quote: "Northbridge felt like an extension of our team from day one. The transparency, the QA cadence and the cultural fit made the decision easy.",
    author: "VP of Customer Experience",
    company: "Series B fintech",
  },
  {
    quote: "We tried three other BPO providers before Northbridge. None of them came close to the quality of agents and operational rigor we see here.",
    author: "Chief Operating Officer",
    company: "E-commerce platform",
  },
  {
    quote: "The ramp-up speed was remarkable. We went from kickoff to 120 trained agents in 5 weeks, and CSAT immediately improved.",
    author: "Senior Director, Customer Support",
    company: "Healthtech company",
  },
];

export function Testimonials() {
  return (
    <section className="flex flex-col bg-[#fafafa] px-5 md:px-20 py-16 md:py-24 gap-10">
      <ScrollReveal>
        <div className="max-w-[620px] flex flex-col gap-3">
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Testimonials</span>
          <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
            Trusted by operations leaders
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {testimonials.map((t, i) => (
          <StaggerItem key={t.author} index={i}>
            <div className="flex flex-col h-full bg-white border border-[#e7e5e4] rounded-2xl p-6 gap-5 transition-all duration-300 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex gap-1">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#0c0a09" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <blockquote className="flex-1 text-[#0c0a09] text-[18px] font-light leading-[1.4] tracking-[-0.18px]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex flex-col shrink-0 border-t border-t-[#e7e5e4] pt-4 gap-0.5">
                <span className="text-[#0c0a09] text-[15px] font-medium leading-[1.4]">{t.author}</span>
                <span className="text-[#777169] text-[14px] leading-[1.5]" style={{ letterSpacing: "0.15px" }}>{t.company}</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
