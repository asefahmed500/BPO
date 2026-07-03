import type { Metadata } from "next";
import { ServicesSection } from "@/components/services-section";
import { CtaSection } from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Our Services | Northbridge BPO",
  description:
    "Customer support, back office, IT helpdesk, sales & lead generation, content moderation, and finance & accounting outsourcing services.",
};

export default function ServicesPage() {
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
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Our Services</span>
          <h1 className="text-[#0c0a09] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.2px]">
            Enterprise-grade outsourcing, tailored to your operations
          </h1>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.6] max-w-[520px]" style={{ letterSpacing: "0.16px" }}>
            From customer experience to back-office processing, our certified teams integrate with your workflows and deliver measurable outcomes.
          </p>
        </div>
      </section>
      <ServicesSection />
      <CtaSection />
    </>
  );
}
