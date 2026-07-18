// src/app/page.tsx
import { Terminal, Cpu, Zap, ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="max-w-4xl mx-auto text-center relative z-20 space-y-8 py-20">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#8EF08A] animate-pulse" />
            Next-Gen AI Core Online
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Build full-stack systems <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-[#8EF08A]">
              using natural language.
            </span>
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Stop fighting boilerplate. Describe your app layout, backend logic, and data structures in simple English. QuickStart generates production-ready code in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#8EF08A] text-black font-semibold px-8 py-4 rounded-full hover:bg-[#7ad677] transition-all group">
              Start Building Free 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#workflow" className="w-full sm:w-auto inline-flex items-center justify-center bg-white/5 border border-white/10 text-white font-medium px-8 py-4 rounded-full hover:bg-white/10 transition-all">
              Watch 2min Demo
            </a>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-6 border-t border-white/5 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From Idea to Production</h2>
            <p className="text-zinc-400">Three automated layers handle the heavy lifting while you keep total control of the source.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#8EF08A]/10 flex items-center justify-center text-[#8EF08A]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Prompt Prompting</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Input features, logic parameters, or API blueprints. The model instantly maps schemas and edge cases.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#8EF08A]/10 flex items-center justify-center text-[#8EF08A]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Multi-Agent Synthesis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Parallel agents generate your React component layout, Prisma DB schemas, and isolated Node.js server routes.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#8EF08A]/10 flex items-center justify-center text-[#8EF08A]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Push to Deploy</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Review the changes inside our sandbox container, then export code clean directly to GitHub or deploy straight to Vercel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Predictable Tiering</h2>
          <p className="text-zinc-400">Start completely free. Scale smoothly as your application userbase grows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
          {/* Free Tier */}
          <div className="border border-white/10 bg-white/[0.01] p-8 rounded-3xl flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Hobbyist</h3>
              <div className="text-4xl font-extrabold text-white">$0</div>
              <p className="text-xs text-zinc-500">Perfect for prototyping side projects and dynamic MVPs.</p>
              <hr className="border-white/10" />
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> 3 Sandbox Applications</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> Clean Next.js/Tailwind Export</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> Basic AI Generation tokens</li>
              </ul>
            </div>
            <a href="#signup" className="w-full text-center bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-full text-sm font-semibold transition-all">
              Deploy Free Project
            </a>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-[#8EF08A] bg-gradient-to-b from-[#8EF08A]/5 to-transparent p-8 rounded-3xl flex flex-col justify-between space-y-8 relative">
            <span className="absolute -top-3.5 right-6 bg-[#8EF08A] text-black text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">Most Popular</span>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Pro Developer</h3>
              <div className="text-4xl font-extrabold text-white">$49<span className="text-sm font-normal text-zinc-500"> / mo</span></div>
              <p className="text-xs text-zinc-400">For production environments and high-velocity independent builders.</p>
              <hr className="border-white/10" />
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> Unlimited Applications</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> Custom Databases &amp; API Routes</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> Advanced Claude 3.5 Sonnet Engine</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8EF08A]" /> Priority 1-click Cloud Hosting</li>
              </ul>
            </div>
            <a href="#signup" className="w-full text-center bg-[#8EF08A] text-black hover:bg-[#7ad677] py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-[#8EF08A]/10">
              Upgrade to Pro Core
            </a>
          </div>
        </div>
      </section>
    </>
