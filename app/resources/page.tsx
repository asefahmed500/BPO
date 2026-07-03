import type { Metadata } from "next";
import Link from "next/link";
import { CtaSection } from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Resources | Northbridge BPO",
  description: "BPO insights, case studies, whitepapers and industry research from Northbridge BPO.",
};

const resources = [
  {
    type: "Case Study",
    title: "How a global retailer cut average handle time by 40%",
    description: "A dedicated 180-seat team, revised QA scorecards and a unified Zendesk workflow.",
  },
  {
    type: "Whitepaper",
    title: "The 2024 BPO Benchmark Report",
    description: "Cost benchmarks, CSAT data and compliance trends across 6 industries and 14 countries.",
  },
  {
    type: "Blog",
    title: "5 signs it&rsquo;s time to scale your customer support team",
    description: "Recognizing the inflection points that signal your in-house team needs BPO support.",
  },
  {
    type: "Case Study",
    title: "How a fintech startup scaled compliance operations 3x",
    description: "KYC/AML processing expanded from 15 to 45 analysts in eight weeks.",
  },
  {
    type: "Whitepaper",
    title: "Security &amp; Compliance in Global BPO",
    description: "A practical guide to SOC 2, ISO 27001 and PCI-DSS when outsourcing critical operations.",
  },
  {
    type: "Blog",
    title: "Building an elastic workforce: the operations playbook",
    description: "How to structure team scaling that flexes with seasonal demand without sacrificing quality.",
  },
];

export default function ResourcesPage() {
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
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Resources</span>
          <h1 className="text-[#0c0a09] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.2px]">
            Insights for operations leaders
          </h1>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.6] max-w-[520px]" style={{ letterSpacing: "0.16px" }}>
            Case studies, benchmarks and guides from the team that runs enterprise outsourcing across 9 delivery centers.
          </p>
        </div>
      </section>

      <section className="bg-[#fafafa] px-5 md:px-20 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {resources.map((r) => (
            <div
              key={r.title}
              className="flex flex-col bg-white border border-[#e7e5e4] rounded-2xl p-6 gap-3 transition-all duration-300 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <span className="text-[#777169] text-[11px] font-semibold tracking-[0.96px] uppercase">{r.type}</span>
              <h3
                className="text-[#0c0a09] text-[18px] font-medium leading-[1.35]"
                style={{ letterSpacing: "0.16px" }}
                dangerouslySetInnerHTML={{ __html: r.title }}
              />
              <p className="text-[#4e4e4e] text-[15px] leading-[1.6] flex-1" style={{ letterSpacing: "0.15px" }}>{r.description}</p>
              <Link
                href="/resources"
                className="flex items-center mt-1 gap-1.5 text-[#292524] text-[15px] font-medium leading-none transition-all duration-200 ease-out"
              >
                Read more
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
