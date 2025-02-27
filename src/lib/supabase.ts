
import { createClient } from '@supabase/supabase-js';

// Use default values for local development if environment variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iwmtpwcdnchxzwiuulla.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bXRwd2NkbmNoeHp3aXV1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjg1MDEsImV4cCI6MjA1NjIwNDUwMX0.8DeWIBpgYUgMJ01hyAp1dHk_yOZ_48lVhcySQ05V9sY';

console.log('Initializing Supabase client with:', { 
  supabaseUrl: supabaseUrl, 
  hasAnonKey: !!supabaseAnonKey 
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test the connection using Promise.then() properly
supabase.from('items').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful, items count:', count);
    }
  })
  .catch((err: Error) => {
    console.error('Exception testing Supabase connection:', err);
  });
