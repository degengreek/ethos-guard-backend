import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  // Only throw in runtime to allow build to pass if envs are missing
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
     console.warn('Missing Supabase environment variables. Check .env.local');
  }
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
