import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickStart.Ai",
  description: "Build Full-Stack Web & Mobile Apps in Minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
