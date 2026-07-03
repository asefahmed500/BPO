import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Northbridge BPO — Enterprise Business Process Outsourcing",
  description:
    "Scale your customer experience without scaling headcount. Northbridge runs your voice, chat, back-office and IT support operations across 9 delivery centers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${garamond.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
