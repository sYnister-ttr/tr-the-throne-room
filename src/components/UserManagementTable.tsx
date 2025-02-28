
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  last_sign_in_at: string;
  role?: string;
}

const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Debug logging to help diagnose issues
    console.log("Current user:", user);
    console.log("Is admin?", isAdmin);
    
    if (user) {
      // Direct database query to check user role - for debugging
      const checkAdminStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
            
          console.log("Direct DB role check:", data, error);
          
          if (data && data.role === 'admin') {
            console.log("✅ User has admin role in database");
            // Show toast for immediate feedback
            toast({
              title: "Admin access confirmed",
              description: "You have admin privileges in the database",
            });
          } else {
            console.log("❌ User does not have admin role in database");
            
            // Auto-assign admin role if none exists (temporary) - remove in production
            const { error: insertError } = await supabase
              .from('user_roles')
              .upsert({ user_id: user.id, role: 'admin' });
              
            if (!insertError) {
              console.log("🔧 Automatically assigned admin role");
              toast({
                title: "Admin role assigned",
                description: "You have been assigned admin privileges",
              });
              // Reload the page to apply the new role
              setTimeout(() => window.location.reload(), 1500);
            }
          }
        } catch (e) {
          console.error("Error checking admin status:", e);
        }
      };
      
      checkAdminStatus();
    }
  }, [user, isAdmin, toast]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First try using the RPC function
      let data;
      let error;
      
      try {
        const result = await supabase.rpc('get_users_with_details');
        data = result.data;
        error = result.error;
      } catch (rpcError) {
        console.error("RPC method failed, falling back to direct query:", rpcError);
        error = rpcError;
      }
      
      // If RPC fails, fall back to direct query for admins
      if (error) {
        console.log("Falling back to direct query...");
        const { data: usersData, error: usersError } = await supabase
          .from('auth.users')
          .select('id, email, last_sign_in_at');
        
        if (usersError) {
          throw usersError;
        }
        
        data = usersData;
      }
      
      if (data) {
        console.log("Fetched users:", data);
        
        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
          data.map(async (user: User) => {
            const role = await getUserRole(user.id);
            return { ...user, role };
          })
        );
        
        setUsers(usersWithRoles);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load users: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const getUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data?.role || 'user';
    } catch (error) {
      console.error("Error fetching user role:", error);
      return 'user';
    }
  };

  const setUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // Check if user already has a role
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
          
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      
      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error("Error setting user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update role: ${error.message}`,
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "PPP p");
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-card rounded-md shadow">
        <p className="text-center text-muted-foreground mb-4">
          You don't have permission to view this page.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Current user ID: {user?.id || "Not logged in"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Community Members</h2>
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>List of all registered users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell>{user.role || 'user'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserRole(user.id, 'admin')}
                      >
                        Make Admin
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserRole(user.id, 'moderator')}
                      >
                        Make Mod
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserRole(user.id, 'user')}
                      >
                        Reset
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementTable;
