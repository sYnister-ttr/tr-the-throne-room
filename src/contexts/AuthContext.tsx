
import { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { AuthContextType, UserRole, UserWithRole } from "@/types/auth";
import { fetchUserRole, signOutUser } from "@/utils/auth-utils";

// Create the context with a meaningful default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  isModerator: false,
  refreshUserRole: async () => {},
});

// Export AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const { toast } = useToast();

  const refreshUserRole = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const role = await fetchUserRole(user.id);
      if (role) {
        setUser({ ...user, role });
        setIsAdmin(role === 'admin');
        setIsModerator(role === 'moderator' || role === 'admin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        console.log("Checking initial auth session...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Failed to get authentication session. Please try logging in again.",
            });
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log("Found authenticated user:", session.user.id);
          setSession(session);
          
          const userWithoutRole = { 
            ...session.user,
            role: undefined as unknown as UserRole
          } as UserWithRole;
          
          setUser(userWithoutRole);
          
          const role = await fetchUserRole(userWithoutRole.id);
          if (role && mounted) {
            setUser({ ...userWithoutRole, role });
            setIsAdmin(role === 'admin');
            setIsModerator(role === 'moderator' || role === 'admin');
          }
        } else if (mounted) {
          console.log("No authenticated user found");
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsModerator(false);
        }
      } catch (error) {
        console.error("Exception checking session:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "An unexpected error occurred. Please try logging in again.",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user && mounted) {
          setSession(session);
          
          const userWithoutRole = { 
            ...session.user,
            role: undefined as unknown as UserRole
          } as UserWithRole;
          
          setUser(userWithoutRole);
          
          const role = await fetchUserRole(userWithoutRole.id);
          if (role && mounted) {
            setUser({ ...userWithoutRole, role });
            setIsAdmin(role === 'admin');
            setIsModerator(role === 'moderator' || role === 'admin');
          }
        } else if (mounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsModerator(false);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out user");
      const { error } = await signOutUser();
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
    } finally {
      setLoading(false);
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

// Don't export the hook from here anymore, it's now in its own file
