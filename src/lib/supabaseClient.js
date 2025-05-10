/** Create and export a Supabase client for authentication/session management */
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

// Initialize Supabase client with session persistence and auto refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  persistSession: true,
  autoRefreshToken: true,
}); 