import { supabase } from './supabaseClient';

export function createSupabaseBrowserClient() {
  if (!supabase) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

export const createClientBrowser = createSupabaseBrowserClient;
export { isSupabaseConfigured, supabase } from './supabaseClient';
