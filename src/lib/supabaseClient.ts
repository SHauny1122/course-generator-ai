import { createClient } from '@supabase/supabase-js';

// Log the environment variables (without their values) to check if they're being loaded
console.log('Environment variables available:', {
  hasUrl: !!import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY
});

const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'social-content-generator-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
});

// Debug auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, userId: session?.user?.id });
});

// Export helper to check auth and subscription access
export const checkAuthAndAccess = async () => {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    return { session, error: null };
  } catch (error) {
    console.error('Error in checkAuthAndAccess:', error);
    return { session: null, error };
  }
};

export { supabase };
