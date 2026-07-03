"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Chatbot } from "@/components/chatbot";

const APP_ROUTES = ["/dashboard", "/admin", "/support", "/sign-in", "/sign-up"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = APP_ROUTES.some((route) => pathname.startsWith(route));

  if (isAppRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
