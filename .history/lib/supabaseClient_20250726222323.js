// lib/supabaseClient.js
// This file initializes the Supabase client for use throughout the app.
// Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure the redirect URL for email confirmations
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/confirm` : undefined,
  },
});
