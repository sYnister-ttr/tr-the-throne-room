
import { createClient } from "@supabase/supabase-js";

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://iwmtpwcdnchxzwiuulla.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bXRwd2NkbmNoeHp3aXV1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjg1MDEsImV4cCI6MjA1NjIwNDUwMX0.8DeWIBpgYUgMJ01hyAp1dHk_yOZ_48lVhcySQ05V9sY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Supabase with proper error handling using async/await
(async function initializeSupabase() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase initialization error:", error);
    } else {
      console.log("Supabase initialized with session:", data.session ? "Active" : "None");
    }
  } catch (error) {
    console.error("Unexpected error during Supabase initialization:", error);
  }
})();
