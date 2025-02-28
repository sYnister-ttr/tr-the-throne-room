
import { createClient } from "@supabase/supabase-js";

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://iwmtpwcdnchxzwiuulla.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bXRwd2NkbmNoeHp3aXV1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjg1MDEsImV4cCI6MjA1NjIwNDUwMX0.8DeWIBpgYUgMJ01hyAp1dHk_yOZ_48lVhcySQ05V9sY";

// Log environment variables for debugging
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key (first 10 chars):", supabaseAnonKey?.substring(0, 10) + "...");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'diablo-market-auth-storage-key',
    autoRefreshToken: true,
    debug: true, // Enable debug mode to see more detailed auth logs
    // Make sure to clear all storage on sign out
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error("localStorage.getItem error:", error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
          return;
        } catch (error) {
          console.error("localStorage.setItem error:", error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
          return;
        } catch (error) {
          console.error("localStorage.removeItem error:", error);
        }
      }
    }
  },
  // Add global error handler for debugging
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      return fetch(url, options).catch(error => {
        console.error("Supabase fetch error:", error);
        throw error;
      });
    }
  }
});

// Initialize Supabase with improved error handling
(async function initializeSupabase() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log("Supabase session:", data.session ? "Active" : "None");
  } catch (error) {
    console.error("Supabase Error:", error instanceof Error ? error.message : String(error));
  }
})();

// Add helper function to check for RLS issues in development mode
export const checkTableAccess = async (tableName: string) => {
  try {
    console.log(`Testing access to ${tableName} table...`);
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    
    if (error) {
      console.error(`⚠️ Access error for ${tableName}:`, error.message);
      if (error.message.includes('permission denied')) {
        console.warn(`🔐 This might be an RLS policy issue. Check your Supabase RLS policies for the ${tableName} table.`);
      }
      return false;
    }
    
    console.log(`✅ Successfully accessed ${tableName} table`);
    return true;
  } catch (error) {
    console.error(`Failed to test ${tableName} access:`, error);
    return false;
  }
};

// Helper to safely access localStorage
export const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("localStorage.getItem error:", error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("localStorage.setItem error:", error);
      return false;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("localStorage.removeItem error:", error);
      return false;
    }
  }
};

// Improved sign out that clears all local storage
export const signOutAndClearStorage = async () => {
  try {
    console.log("Signing out and clearing storage...");
    // First sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear auth-related localStorage items
    localStorage.removeItem('diablo-market-auth-storage-key');
    localStorage.removeItem('supabase.auth.token');
    
    // Force page reload to ensure clean state
    window.location.href = '/';
    
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error };
  }
};
