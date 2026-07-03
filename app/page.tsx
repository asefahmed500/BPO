import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { DashboardSection } from "@/components/dashboard-section";
import { ServicesSection } from "@/components/services-section";
import { WhyNorthbridge } from "@/components/why-northbridge";
import { StatsSection } from "@/components/stats-section";
import { CaseStudy } from "@/components/case-study";
import { Testimonials } from "@/components/testimonials";
import { CtaSection } from "@/components/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <DashboardSection />
      <ServicesSection />
      <WhyNorthbridge />
      <StatsSection />
      <CaseStudy />
      <Testimonials />
      <CtaSection />
    </>
  );
}
