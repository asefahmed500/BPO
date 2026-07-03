"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "-40px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`animate-reveal ${revealed ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function StaggerGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  index = 0,
  baseDelay = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  baseDelay?: number;
  className?: string;
}) {
  return (
    <ScrollReveal delay={baseDelay + index * 40} className={className}>
      {children}
    </ScrollReveal>
  );
}
