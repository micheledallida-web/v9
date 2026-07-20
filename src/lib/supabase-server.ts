import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads the user's session from cookies so that RLS policies
 * can be applied correctly.
 *
 * Returns `null` when the required environment variables are not set so that
 * callers can handle the unconfigured case gracefully (e.g. redirect to login).
 *
 * Usage:
 *   const supabase = await createSupabaseServerClient();
 *   if (!supabase) redirect('/');
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies — only Route Handlers /
          // Server Actions can. Silently ignore so reads still work.
        }
      },
    },
  });
}
