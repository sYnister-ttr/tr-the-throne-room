
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iwmtpwcdnchxzwiuulla.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bXRwd2NkbmNoeHp3aXV1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjg1MDEsImV4cCI6MjA1NjIwNDUwMX0.8DeWIBpgYUgMJ01hyAp1dHk_yOZ_48lVhcySQ05V9sY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Initialize Supabase client with proper options
export const supabase = createClient(supabase_url, supabase_anon_key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Log supabase authentication status on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase initialization error:", error);
  } else {
    console.log("Supabase initialized with session:", data.session ? "Active" : "None");
  }
});

// Add a global error handler for Supabase requests
supabase.handleError = (error: any) => {
  console.error("Supabase error:", error);
  
  // Check for specific error types
  if (error.message?.includes('JWT')) {
    console.error("JWT error - session may be invalid");
  }
  if (error.code === 'PGRST301') {
    console.error("Database connection error");
  }
};

