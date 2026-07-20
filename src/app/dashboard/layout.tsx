import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();

  // Redirect to landing page if Supabase is not configured or the visitor
  // is not authenticated.
  if (!supabase) {
    redirect('/');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-slate-100 lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-white/10 lg:border-b-0 lg:border-r">
        <SidebarNav />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
