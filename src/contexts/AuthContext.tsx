
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, signOutAndClearStorage } from "@/lib/supabase";

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
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
      console.log("User role data:", data);
      return data?.role || 'user';
    } catch (error) {
      console.error("Exception fetching user role:", error);
      return null;
    }
  };

  const refreshUserRole = async () => {
    if (!user) return;
    
    try {
      const role = await fetchUserRole(user.id);
      if (role) {
        setUser({ ...user, role: role as UserRole });
        setIsAdmin(role === 'admin');
        setIsModerator(role === 'moderator' || role === 'admin');
        console.log("User role refreshed:", role);
      }
    } catch (error) {
      console.error("Error refreshing user role:", error);
    }
  };

  useEffect(() => {
    // Initial auth state check
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          console.log("Found authenticated user:", data.session.user.id);
          const userWithoutRole = { 
            ...data.session.user,
            role: undefined as unknown as UserRole
          } as UserWithRole;
          
          setUser(userWithoutRole);
          
          const role = await fetchUserRole(userWithoutRole.id);
          if (role) {
            setUser({ ...userWithoutRole, role: role as UserRole });
            setIsAdmin(role === 'admin');
            setIsModerator(role === 'moderator' || role === 'admin');
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
