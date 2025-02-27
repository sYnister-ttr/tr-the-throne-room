
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iwmtpwcdnchxzwiuulla.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bXRwd2NkbmNoeHp3aXV1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4NTY4OTgsImV4cCI6MjAyMzQzMjg5OH0.OjXhrEBjHE5IuXLr7ZfkN3xolEV9EyPOtu8vDCqBuV4";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
