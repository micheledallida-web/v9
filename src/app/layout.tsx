import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickStart.Ai | Build Full-Stack Applications Instantly",
  description: "Autonomous high-velocity AI system builder for web and mobile software ecosystems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-brandBg text-white antialiased">
        {children}
      </body>
    </html>
  );
}