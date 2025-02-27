
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
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
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Type assertion to match UserWithRole
        const userWithoutRole = session.user as UserWithRole;
        setUser(userWithoutRole);
        
        fetchUserRole(userWithoutRole.id).then(role => {
          if (role) {
            setUser({ ...userWithoutRole, role: role as UserRole });
            setIsAdmin(role === 'admin');
            setIsModerator(role === 'moderator' || role === 'admin');
          }
        });
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsModerator(false);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Type assertion to match UserWithRole
        const userWithoutRole = session.user as UserWithRole;
        setUser(userWithoutRole);
        
        const role = await fetchUserRole(userWithoutRole.id);
        if (role) {
          setUser({ ...userWithoutRole, role: role as UserRole });
          setIsAdmin(role === 'admin');
          setIsModerator(role === 'moderator' || role === 'admin');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsModerator(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsModerator(false);
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
