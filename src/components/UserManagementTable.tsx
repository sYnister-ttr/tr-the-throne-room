
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
  const { isAdmin, user, refreshUserRole } = useAuth();
  const { toast } = useToast();

  // Make sure we refresh the user's role when the component mounts
  useEffect(() => {
    refreshUserRole();
  }, [refreshUserRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First, check if the function exists and can be called
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_users_with_details');
        
      if (!functionError && functionData) {
        console.log("Successfully fetched users via RPC function:", functionData);
        
        // Process the data from the function
        const usersWithRoles = await Promise.all(
          functionData.map(async (userData: any) => {
            const role = await getUserRole(userData.id);
            return { ...userData, role };
          })
        );
        
        setUsers(usersWithRoles);
      } else {
        console.log("Function error or not available:", functionError);
        
        // Fallback to direct query
        const { data, error } = await supabase
          .from('auth.users')
          .select('id, email, last_sign_in_at');
        
        if (error) {
          console.error("Error fetching users:", error);
          throw error;
        }
        
        if (data) {
          console.log("Fetched users via direct query:", data);
          
          // Fetch roles for each user
          const usersWithRoles = await Promise.all(
            data.map(async (user: User) => {
              const role = await getUserRole(user.id);
              return { ...user, role };
            })
          );
          
          setUsers(usersWithRoles);
        }
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
    if (isAdmin && user) {
      fetchUsers();
    }
  }, [isAdmin, user]);

  const getUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return 'user';
      }
      return data?.role || 'user';
    } catch (error) {
      console.error("Error fetching user role:", error);
      return 'user';
    }
  };

  const setUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // Upsert approach is more reliable
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        });
          
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      
      // If changing the current user's role, refresh their role
      if (user && userId === user.id) {
        await refreshUserRole();
      }
      
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
