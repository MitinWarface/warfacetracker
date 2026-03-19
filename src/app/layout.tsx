// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title:       { default: "WF Tracker", template: "%s — WF Tracker" },
  description: "Advanced Warface statistics tracker — K/D history, weapon analytics, clan rankings.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-wf-bg text-wf-text antialiased`} suppressHydrationWarning>
        <Navbar />
        <Sidebar />
        <main className="lg:pl-64">
          {children}
        </main>
      </body>
    </html>
  );
}
