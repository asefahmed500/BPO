"use client";

import Link from "next/link";
import { ScrollReveal, StaggerItem } from "@/components/scroll-reveal";

const services = [
  {
    title: "Customer Support",
    description: "Voice, live chat, email and social support delivered 24/7 in 20+ languages.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
        <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
      </svg>
    ),
  },
  {
    title: "Back Office &amp; Data",
    description: "Data processing, entry, validation and document management at scale.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
  },
  {
    title: "IT &amp; Technical Helpdesk",
    description: "Tier 1&ndash;3 technical support and helpdesk for products and infrastructure.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m9.17 14.83-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "Sales &amp; Lead Generation",
    description: "Outbound prospecting, qualification and inbound sales conversion.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "Content Moderation",
    description: "Trust &amp; safety review, policy enforcement and UGC moderation.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Finance &amp; Accounting",
    description: "AP/AR, reconciliation, payroll and reporting handled by certified teams.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="16" x2="16" y1="14" y2="18" />
        <path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" />
        <path d="M12 14h.01" /><path d="M8 14h.01" />
        <path d="M12 18h.01" /><path d="M8 18h.01" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  return (
    <section className="flex flex-col bg-[#fafafa] px-5 md:px-20 py-16 md:py-24 gap-10">
      <ScrollReveal>
        <div className="max-w-[620px] flex flex-col gap-3">
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">What we do</span>
          <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
            One partner for every outsourced operation
          </h2>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.5] max-w-[540px]" style={{ letterSpacing: "0.16px" }}>
            From front-line customer support to complex finance and accounting, our teams plug into your workflows and tools like an extension of your own.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {services.map((svc, i) => (
          <StaggerItem key={svc.title} index={i}>
            <div className="group flex flex-col bg-white border border-[#e7e5e4] rounded-2xl p-6 gap-4 transition-all duration-300 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="size-11 flex justify-center items-center bg-[#f0efed] rounded-full transition-transform duration-300 group-hover:scale-110">
                {svc.icon}
              </div>
              <h3 className="text-[#0c0a09] text-[20px] font-medium leading-[1.35]" style={{ letterSpacing: "0.16px" }} dangerouslySetInnerHTML={{ __html: svc.title }} />
              <p className="text-[#4e4e4e] text-[15px] leading-[1.5] flex-1" style={{ letterSpacing: "0.15px" }} dangerouslySetInnerHTML={{ __html: svc.description }} />
              <Link
                href="/services"
                className="flex items-center mt-1 gap-1.5 text-[#292524] text-[15px] font-medium leading-none transition-all duration-200 ease-out"
              >
                Learn more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-[2px]">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
