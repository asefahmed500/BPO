import type { Metadata } from "next";
import Link from "next/link";
import { CtaSection } from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Industries | Northbridge BPO",
  description: "BPO solutions for e-commerce, healthcare, finance, technology, logistics, and telecommunications.",
};

const industries = [
  {
    name: "E-commerce &amp; Retail",
    description:
      "24/7 customer support, order management, returns processing and fraud prevention for online retailers handling high seasonal volumes.",
  },
  {
    name: "Healthcare &amp; Life Sciences",
    description:
      "HIPAA-compliant medical billing, prior authorization, patient scheduling and claims processing by certified healthcare professionals.",
  },
  {
    name: "Financial Services",
    description:
      "KYC/AML verification, loan processing, accounts payable/receivable and reconciliation with SOC 2 Type II controls.",
  },
  {
    name: "Technology &amp; SaaS",
    description:
      "Tier 1&ndash;3 technical support, NOC monitoring, customer onboarding and QA testing for fast-growing tech companies.",
  },
  {
    name: "Logistics &amp; Supply Chain",
    description:
      "Freight tracking, customs documentation, carrier coordination and real-time shipment monitoring across global routes.",
  },
  {
    name: "Telecommunications",
    description:
      "Multi-language call center, technical support, field service dispatch and churn management for telecom operators.",
  },
];

export default function IndustriesPage() {
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
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Industries</span>
          <h1 className="text-[#0c0a09] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.2px]">
            Industry-specific solutions that scale
          </h1>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.6] max-w-[520px]" style={{ letterSpacing: "0.16px" }}>
            Every industry has unique compliance, language and workflow requirements. We design delivery teams that match yours.
          </p>
        </div>
      </section>

      <section className="bg-[#fafafa] px-5 md:px-20 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {industries.map((ind, i) => (
            <div
              key={ind.name}
              className="flex flex-col bg-white border border-[#e7e5e4] rounded-2xl p-6 gap-4 transition-all duration-300 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <h3
                className="text-[#0c0a09] text-[20px] font-medium leading-[1.35]"
                style={{ letterSpacing: "0.16px" }}
                dangerouslySetInnerHTML={{ __html: ind.name }}
              />
              <p
                className="text-[#4e4e4e] text-[15px] leading-[1.6] flex-1"
                style={{ letterSpacing: "0.15px" }}
                dangerouslySetInnerHTML={{ __html: ind.description }}
              />
              <Link
                href="/contact"
                className="flex items-center mt-1 gap-1.5 text-[#292524] text-[15px] font-medium leading-none transition-all duration-200 ease-out"
              >
                Learn more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-[2px]">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
