import React from 'react';
import { Hero, Features } from '@/components/Hero';

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-opacity duration-1000 ${className}`}>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Reveal>
        <Hero />
      </Reveal>
      <Features />
    </main>
  );
}
