"use client";

import Link from "next/link";
import { useState } from "react";

const footerLinks = {
  Services: [
    { label: "Customer Support", href: "/services" },
    { label: "Back Office &amp; Data", href: "/services" },
    { label: "IT &amp; Technical Helpdesk", href: "/services" },
    { label: "Sales &amp; Lead Generation", href: "/services" },
    { label: "Content Moderation", href: "/services" },
    { label: "Finance &amp; Accounting", href: "/services" },
  ],
  Industries: [
    { label: "Fintech &amp; Banking", href: "/industries" },
    { label: "Healthcare &amp; MedTech", href: "/industries" },
    { label: "E-Commerce &amp; Retail", href: "/industries" },
    { label: "SaaS &amp; Technology", href: "/industries" },
    { label: "Travel &amp; Hospitality", href: "/industries" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Resources", href: "/resources" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Compliance", href: "/compliance" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch {
      // silently fail
    }
  };

  return (
    <footer className="flex flex-col bg-[#1c1917] px-5 md:px-20 pt-16 md:pt-20 pb-8 gap-12">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
        <div className="flex flex-col gap-4 max-w-[260px]">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-white text-[19px] font-medium tracking-[-0.3px]">
              Northbridge<span className="text-[#777169]">BPO</span>
            </span>
          </Link>
          <p className="text-[#a8a29e] text-[15px] leading-[1.47]" style={{ letterSpacing: "0.15px" }}>
            Enterprise-grade outsourcing without the enterprise bureaucracy.
          </p>
          <div className="flex items-center gap-3 mt-1">
            {["linkedin", "twitter", "youtube"].map((social) => (
              <Link
                key={social}
                href="#"
                className="flex size-9 items-center justify-center border border-[#57534e] rounded-full text-[#a8a29e] transition-all duration-200 ease-out hover:text-white hover:border-white"
              >
                {social === "linkedin" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                )}
                {social === "twitter" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {social === "youtube" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-wrap gap-8 md:gap-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-3 min-w-[120px]">
              <span className="text-white text-[12px] font-semibold tracking-[0.96px] uppercase">{category}</span>
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[#a8a29e] text-[15px] leading-[1.47] transition-colors duration-200 hover:text-white"
                  style={{ letterSpacing: "0.15px" }}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center sm:flex-row gap-4 border-t border-t-[#292524] pt-8">
        <span className="text-[#777169] text-[13px]" style={{ letterSpacing: "0.15px" }}>
          &copy; {new Date().getFullYear()} Northbridge BPO. All rights reserved.
        </span>
        <form onSubmit={handleSubscribe} className="flex items-center sm:ml-auto gap-2">
          <span className="text-[#a8a29e] text-[13px] whitespace-nowrap" style={{ letterSpacing: "0.15px" }}>Stay updated</span>
          <div className="flex items-center bg-[#292524] rounded-full pl-4 pr-[3px] py-[3px] gap-2 w-[240px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={subscribed ? "Subscribed!" : "your@email.com"}
              className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-[#57534e]"
              disabled={subscribed}
            />
            <button
              type="submit"
              disabled={subscribed}
              className="flex shrink-0 items-center justify-center size-9 bg-white rounded-full text-[#0c0a09] transition-all duration-200 ease-out active:scale-[0.95] disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </footer>
  );
}
