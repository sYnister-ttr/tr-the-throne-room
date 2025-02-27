
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export type UserRole = "admin" | "moderator" | "user";

interface UserWithRole extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: UserWithRole | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  isModerator: false,
  refreshUserRole: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
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
      return data?.role || 'user';
    } catch (error) {
      console.error("Exception fetching user role:", error);
      return null;
    }
  };

  const refreshUserRole = async () => {
    if (!user) return;
    
    const role = await fetchUserRole(user.id);
    if (role) {
      setUser({ ...user, role: role as UserRole });
      setIsAdmin(role === 'admin');
      setIsModerator(role === 'moderator' || role === 'admin');
    }
  };

  useEffect(() => {
    // Initial auth state check
    const checkSession = async () => {
      try {
        console.log("Checking initial auth session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to get authentication session. Please try logging in again.",
          });
          setLoading(false);
          return;
        }
        
        if (data.session?.user) {
          console.log("Found authenticated user:", data.session.user.id);
          setSession(data.session);
          
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
          setSession(null);
          setIsAdmin(false);
          setIsModerator(false);
        }
      } catch (error) {
        console.error("Exception checking session:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try logging in again.",
        });
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
          setSession(session);
          
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
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsModerator(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    try {
      console.log("Signing out user");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign out",
        });
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setIsModerator(false);
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out",
        });
      }
    } catch (error) {
      console.error("Exception signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while signing out",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
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
