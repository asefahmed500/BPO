"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "Industries", href: "/industries", hasDropdown: true },
  { label: "About", href: "/about", hasDropdown: false },
  { label: "Careers", href: "/careers", hasDropdown: false },
  { label: "Resources", href: "/resources", hasDropdown: false },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex justify-center pt-3 px-5">
      <div className="flex h-[56px] items-center bg-white/85 backdrop-blur-lg border border-[#e7e5e4] rounded-2xl shadow-sm px-5 gap-6 max-w-[1200px] w-full transition-shadow duration-300">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="text-[#0c0a09] text-[19px] font-medium tracking-[-0.3px]">
            Northbridge<span className="text-[#777169]">BPO</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center flex-1 gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 text-[#4e4e4e] text-[14px] font-medium leading-[1.4] transition-colors duration-200 hover:text-[#0c0a09]"
            >
              {link.label}
              {link.hasDropdown && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#a8a29e]">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/sign-in"
            className="hidden sm:flex text-[#4e4e4e] text-[14px] font-medium leading-[1.4] transition-colors duration-200 hover:text-[#0c0a09]"
          >
            Sign In
          </Link>

          <Link
            href="/contact"
            className="hidden sm:flex h-[36px] items-center bg-[#292524] rounded-full px-4 text-white text-[14px] font-medium leading-none transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Get a Quote
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex lg:hidden size-9 items-center justify-center border rounded-lg border-[#d6d3d1] text-[#0c0a09] transition-colors hover:border-[#a8a29e] active:scale-[0.95]"
            aria-label="Toggle menu"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-3 right-3 mt-2 bg-white/95 backdrop-blur-lg border border-[#e7e5e4] rounded-2xl shadow-sm px-5 py-5 flex flex-col gap-3 lg:hidden animate-fade-in-up max-w-[1200px] mx-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-[#4e4e4e] text-[15px] font-medium py-1.5 transition-colors hover:text-[#0c0a09]"
            >
              {link.label}
              {link.hasDropdown && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#a8a29e]">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-[#e7e5e4] mt-1">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="flex h-[38px] items-center justify-center border border-[#d6d3d1] rounded-full text-[#0c0a09] text-[14px] font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex h-[38px] items-center justify-center bg-[#292524] rounded-full text-white text-[14px] font-medium"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
