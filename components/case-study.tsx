"use client";

import Link from "next/link";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/scroll-reveal";

export function CaseStudy() {
  return (
    <section className="flex flex-col bg-[#f5f5f5] px-5 md:px-20 py-16 md:py-24 gap-10">
      <ScrollReveal>
        <div className="max-w-[620px] flex flex-col gap-3">
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Case study</span>
          <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
            How a fintech scaled support by 400% in 6 months
          </h2>
        </div>
      </ScrollReveal>

      <StaggerGroup className="flex flex-col lg:flex-row gap-8 items-center">
        <StaggerItem index={0}>
          <div className="w-full lg:w-[540px] h-[340px] rounded-2xl overflow-clip bg-[#f0efed] shrink-0">
            <div
              className="size-full bg-cover bg-no-repeat transition-transform duration-[10s] hover:scale-105"
              style={{ backgroundImage: "url('https://cdn.wonder.so/images/019f2454-18f2-7e4c-9803-a585400e5feb/84ea28e42db7de488b24cda588e18e99b7f694a0e314a85e2660cb09ab84c7e7.jpg')" }}
            />
          </div>
        </StaggerItem>

        <StaggerItem index={1}>
          <div className="flex flex-col gap-4 max-w-[480px]">
            <div className="flex items-center gap-2">
              <div className="flex bg-[#e7f0e7] rounded-full px-3 py-[5px] gap-1.5 items-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2b5c2b" strokeWidth="1.5" strokeLinecap="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                <span className="text-[#2b5c2b] text-[12px] font-semibold tracking-[0.96px] uppercase">400% growth</span>
              </div>
            </div>
            <h3 className="text-[#0c0a09] text-[20px] font-medium leading-[1.35]" style={{ letterSpacing: "0.16px" }}>
              From 50 to 250 agents in 6 months
            </h3>
            <p className="text-[#4e4e4e] text-[15px] leading-[1.5]" style={{ letterSpacing: "0.15px" }}>
              A fast-growing fintech platform needed to scale its support operation without
              compromising on quality. Northbridge deployed a dedicated team across two
              delivery centers, integrating with Zendesk, Salesforce and their internal QA tools
              in under 5 weeks.
            </p>
            <ul className="flex flex-col gap-2 mt-1">
              {[
                "CSAT improved from 82% to 94% within 90 days",
                "Average handle time reduced by 22%",
                "Cost per contact reduced by 55% vs onshore",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[#4e4e4e] text-[15px] leading-[1.5]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a7e5d3" strokeWidth="2" strokeLinecap="round" className="mt-[3px] shrink-0">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/resources"
              className="flex items-center mt-2 gap-1.5 text-[#292524] text-[15px] font-medium leading-none transition-all duration-200 ease-out"
            >
              Read the full case study
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-[2px]">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
