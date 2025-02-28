
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, signOutAndClearStorage } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "admin" | "moderator" | "user";

interface UserWithRole extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: UserWithRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  isModerator: false,
  refreshUserRole: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const fetchUserRole = async (userId: string) => {
    if (!userId) return null;
    
    try {
      console.log("Fetching role for user ID:", userId);
      
      // First check if the user_roles table is accessible
      const { count, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error accessing user_roles table:", countError);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "Unable to access user roles. This might be a permissions issue."
        });
        return null;
      }
      
      console.log("Successfully accessed user_roles table. Count:", count);
      
      // Now try to fetch the specific user's role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        toast({
          variant: "destructive",
          title: "Role Error",
          description: `Failed to fetch role: ${error.message}`
        });
        return null;
      }
      
      console.log("User role data:", data);
      
      if (!data) {
        // If no role found, create default user role for this user
        console.log("No role found for user. Attempting to create default role...");
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'user' });
          
        if (insertError) {
          console.error("Error creating default user role:", insertError);
          return 'user'; // Return default anyway
        }
        
        console.log("Created default user role successfully");
        return 'user';
      }
      
      return data.role || 'user';
    } catch (error) {
      console.error("Exception fetching user role:", error);
      return null;
    }
  };

  const refreshUserRole = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log("Refreshing role for user:", user.id);
      
      const role = await fetchUserRole(user.id);
      
      if (role) {
        console.log("Updated user role to:", role);
        setUser({ ...user, role: role as UserRole });
        setIsAdmin(role === 'admin');
        setIsModerator(role === 'moderator' || role === 'admin');
      } else {
        console.warn("Could not determine user role, defaulting to regular user");
        setUser({ ...user, role: 'user' as UserRole });
        setIsAdmin(false);
        setIsModerator(false);
      }
    } catch (error) {
      console.error("Error refreshing user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh user role. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial auth state check
    const checkSession = async () => {
      try {
        setLoading(true);
        console.log("Checking auth session...");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          return;
        }
        
        if (data.session?.user) {
          console.log("Found authenticated user:", data.session.user.id);
          const userWithoutRole = { 
            ...data.session.user,
            role: undefined as unknown as UserRole
          } as UserWithRole;
          
          setUser(userWithoutRole);
          
          const role = await fetchUserRole(userWithoutRole.id);
          if (role) {
            console.log("User has role:", role);
            setUser({ ...userWithoutRole, role: role as UserRole });
            setIsAdmin(role === 'admin');
            setIsModerator(role === 'moderator' || role === 'admin');
          } else {
            console.log("No role found for user, defaulting to 'user'");
            setUser({ ...userWithoutRole, role: 'user' });
          }
        } else {
          console.log("No authenticated user found");
          setUser(null);
          setIsAdmin(false);
          setIsModerator(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user) {
          setLoading(true);
          const userWithoutRole = { 
            ...session.user,
            role: undefined as unknown as UserRole
          } as UserWithRole;
          
          setUser(userWithoutRole);
          
          const role = await fetchUserRole(userWithoutRole.id);
          if (role) {
            setUser({ ...userWithoutRole, role: role as UserRole });
            setIsAdmin(role === 'admin');
            setIsModerator(role === 'moderator' || role === 'admin');
          } else {
            setUser({ ...userWithoutRole, role: 'user' });
          }
          setLoading(false);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsModerator(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("Signing out from AuthContext...");
      const result = await signOutAndClearStorage();
      if (!result.success) {
        console.error("Error in signOut:", result.error);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signOut, 
      isAdmin, 
      isModerator, 
      refreshUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
