import type { SupabaseClient } from '@supabase/supabase-js';

import { requireSupabaseClient } from './supabaseClient';

export function createSupabaseBrowserClient(): SupabaseClient {
  return requireSupabaseClient();
}

export const createClientBrowser = createSupabaseBrowserClient;
export { isSupabaseConfigured, requireSupabaseClient, supabase } from './supabaseClient';
