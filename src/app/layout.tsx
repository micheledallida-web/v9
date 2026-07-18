// src/app/layout.tsx
import type { Metadata } from "next";
import { Twitter, Github, Slack } from "lucide-react";
import "./globals.css"; // Ensure your Tailwind styles import here

export const metadata: Metadata = {
  title: "QuickStart.Ai | Build Full-Stack Apps in Minutes",
  description: "Autonomous web & mobile system builder using natural language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#090909] text-white antialiased font-sans selection:bg-[#8EF08A] selection:text-black min-h-screen relative overflow-x-hidden">
        
        {/* Persistent Background Shell Layers */}
        <div className="radial-vignette fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(9,9,9,0.9)_100%)]" />
        
        {/* Fixed Header / Navbar Frame Component */}
        <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-[#090909]/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="#" className="flex items-center gap-3 group">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#8EF08A] transition-colors duration-300">
                QuickStart<span className="text-[#8EF08A]">.Ai</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </nav>

            <div>
              <a href="#signup" className="inline-flex items-center justify-center bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#8EF08A] transition-all duration-300">
                Get Started
              </a>
            </div>
          </div>
        </header>

        {/* The Canvas Injector */}
        <main className="relative z-10 pt-20">
          {children}
        </main>

        {/* Fixed Footer Frame Component */}
        <footer className="border-t border-white/10 bg-[#050505] relative z-20 py-16 px-6 text-sm text-zinc-400">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <span className="font-bold text-white text-lg">QuickStart<span className="text-[#8EF08A]">.Ai</span></span>
              <p className="text-xs leading-relaxed max-w-xs text-zinc-500">
                Autonomous systems builder. Generates modern frontends, backends, and deployment files instantly.
              </p>
              <p className="text-[11px] text-zinc-600">&copy; 2026 QuickStart.Ai Inc.</p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Use</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Social</h4>
              <div className="flex gap-4 text-zinc-400">
                <a href="#" className="hover:text-white"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white"><Github className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white"><Slack className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
