
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types/auth";

export const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    console.log("Fetching role for user ID:", userId);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    console.log("User role data:", data);
    return data?.role as UserRole || 'user';
  } catch (error) {
    console.error("Exception fetching user role:", error);
    return null;
  }
};

export const signOutUser = async () => {
  return await supabase.auth.signOut();
};
