"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", company: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <>
      <section className="flex relative min-h-[400px] items-center justify-center bg-[#f5f5f5] px-5 md:px-20 py-20 md:py-28 overflow-clip">
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
          <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Contact</span>
          <h1 className="text-[#0c0a09] text-[36px] md:text-[48px] font-light leading-[1.08] tracking-[-1.2px]">
            Let&rsquo;s talk about your outsourcing goals
          </h1>
          <p className="text-[#4e4e4e] text-[16px] leading-[1.6] max-w-[520px]" style={{ letterSpacing: "0.16px" }}>
            Tell us about your volumes and requirements. We&rsquo;ll design a delivery model and respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="bg-[#fafafa] px-5 md:px-20 py-16 md:py-24">
        <div className="max-w-[880px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:col-span-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#0c0a09] text-[13px] font-medium" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                required
                className="h-[48px] bg-white border border-[#e7e5e4] rounded-xl px-4 text-[15px] text-[#0c0a09] placeholder:text-[#a8a29e] outline-none transition-all duration-200 focus:border-[#d6d3d1] focus:shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#0c0a09] text-[13px] font-medium" htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                required
                className="h-[48px] bg-white border border-[#e7e5e4] rounded-xl px-4 text-[15px] text-[#0c0a09] placeholder:text-[#a8a29e] outline-none transition-all duration-200 focus:border-[#d6d3d1] focus:shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#0c0a09] text-[13px] font-medium" htmlFor="company">Company</label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                className="h-[48px] bg-white border border-[#e7e5e4] rounded-xl px-4 text-[15px] text-[#0c0a09] placeholder:text-[#a8a29e] outline-none transition-all duration-200 focus:border-[#d6d3d1] focus:shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#0c0a09] text-[13px] font-medium" htmlFor="message">Tell us about your needs</label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Service volumes, target timeline, locations, etc."
                required
                className="bg-white border border-[#e7e5e4] rounded-xl px-4 py-3 text-[15px] text-[#0c0a09] placeholder:text-[#a8a29e] outline-none transition-all duration-200 focus:border-[#d6d3d1] focus:shadow-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-[48px] bg-[#292524] rounded-full text-white text-[15px] font-medium leading-none transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Sending..." : status === "success" ? "Sent! We&rsquo;ll be in touch." : "Send Inquiry"}
            </button>
            {status === "error" && (
              <span className="text-[#dc2626] text-[13px] text-center">Something went wrong. Please try again.</span>
            )}
          </form>

          <div className="flex flex-col gap-8 lg:col-span-2 lg:pt-0 pt-4 border-t lg:border-t-0 lg:border-l border-[#e7e5e4] lg:pl-10">
            <div className="flex flex-col gap-2">
              <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Call us</span>
              <a href="tel:+15550000000" className="text-[#0c0a09] text-[22px] font-light leading-[1.2] tracking-[-0.22px] transition-colors hover:text-[#292524]">+1 (555) 000-0000</a>
              <span className="text-[#777169] text-[14px]" style={{ letterSpacing: "0.15px" }}>Available 24/7</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Email</span>
              <a href="mailto:hello@northbridgebpo.com" className="text-[#0c0a09] text-[22px] font-light leading-[1.2] tracking-[-0.22px] transition-colors hover:text-[#292524]">hello@northbridgebpo.com</a>
              <span className="text-[#777169] text-[14px]" style={{ letterSpacing: "0.15px" }}>Response within 4 hours</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">Headquarters</span>
              <span className="text-[#0c0a09] text-[22px] font-light leading-[1.2] tracking-[-0.22px]">Manila, Philippines</span>
              <span className="text-[#777169] text-[14px]" style={{ letterSpacing: "0.15px" }}>9 delivery centers worldwide</span>
            </div>
            <a
              href="tel:+15550000000"
              className="flex h-[44px] items-center justify-center border border-[#d6d3d1] rounded-full text-[#0c0a09] text-[14px] font-medium gap-2 transition-all duration-200 hover:border-[#a8a29e] active:scale-[0.97]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777169" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Book a Call
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
