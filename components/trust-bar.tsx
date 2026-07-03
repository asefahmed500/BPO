"use client";

import { useEffect, useRef, useState } from "react";

const companies = [
  "PalmPay", "Lendable", "Kuda", "Flutterwave", "M-Pesa",
];

const certs = [
  { label: "SOC 2", caption: "Security" },
  { label: "ISO 27001", caption: "InfoSec" },
  { label: "PCI-DSS", caption: "Payments" },
];

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          o.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="flex flex-col bg-[#f5f5f5] px-5 md:px-20 py-16 md:py-20 gap-10"
    >
      <div
        className={`flex flex-col items-center gap-3 text-center transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Trusted by</span>
        <div className="grid grid-cols-3 md:flex md:flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {companies.map((name, i) => (
            <span
              key={name}
              className={`text-[#4e4e4e] text-[15px] font-medium leading-[1.4] transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-[400ms] ease-out delay-[160ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {certs.map((cert) => (
          <div
            key={cert.label}
            className="flex items-center bg-white border border-[#e7e5e4] rounded-full px-4 py-2 gap-2.5 transition-all duration-200 hover:shadow-sm"
          >
            <div className="size-7 flex justify-center items-center bg-[#f0efed] rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[#0c0a09] text-[14px] font-medium leading-[1.3]">{cert.label}</span>
              <span className="text-[#777169] text-[11px] leading-[1.3]">{cert.caption}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
