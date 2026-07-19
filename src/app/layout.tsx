// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuickStart.Ai | Build Full-Stack Apps in Minutes",
  description: "Autonomous web & mobile system builder using natural language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intentionally minimal: LandingPage.tsx (and any other top-level page)
  // renders its own <header>, <footer>, background layers, and cursor.
  // Keeping those out of the layout avoids doubling up the chrome on
  // every route. If you add more pages later that need a shared shell,
  // build a reusable <SiteHeader />/<SiteFooter /> pair and mount them
  // here instead of duplicating markup per-page.
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans min-h-screen">{children}</body>
    </html>
  );
}
