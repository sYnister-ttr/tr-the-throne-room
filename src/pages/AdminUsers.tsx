
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import UserManagementTable from "@/components/UserManagementTable";
import { Button } from "@/components/ui/button"; 
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const AdminUsers = () => {
  const { isAdmin, loading, user, refreshUserRole } = useAuth();
  const navigate = useNavigate();
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [dbAccessible, setDbAccessible] = useState(false);

  // Check if the user_roles table is accessible
  useEffect(() => {
    const checkDatabaseAccess = async () => {
      try {
        console.log("Checking database access...");
        const { count, error } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error("Error accessing database:", error);
          setDbAccessible(false);
          toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not access the database. Please check your connection and permissions."
          });
        } else {
          console.log("Database is accessible. User roles count:", count);
          setDbAccessible(true);
        }
      } catch (error) {
        console.error("Exception checking database:", error);
        setDbAccessible(false);
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    if (user) {
      checkDatabaseAccess();
    } else {
      setCheckingPermissions(false);
    }
  }, [user]);

  // Refresh user role when component mounts
  useEffect(() => {
    const loadUserRole = async () => {
      console.log("AdminUsers: Loading user role...");
      await refreshUserRole();
      console.log("AdminUsers: User role refreshed. isAdmin:", isAdmin);
    };
    
    if (user) {
      loadUserRole();
    }
  }, [user, refreshUserRole, isAdmin]);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && !checkingPermissions && !isAdmin) {
      console.log("User is not admin, redirecting to home");
      navigate("/");
    }
  }, [isAdmin, loading, navigate, checkingPermissions]);

  // Create admin role for this user function
  const makeUserAdmin = async () => {
    if (!user) return;
    
    try {
      console.log("Attempting to make current user an admin...");
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role: 'admin' 
        });
        
      if (error) {
        console.error("Error making user admin:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update role: ${error.message}`
        });
        return;
      }
      
      console.log("Successfully made user an admin");
      toast({
        title: "Success",
        description: "You are now an admin. Refreshing your role..."
      });
      
      await refreshUserRole();
      
    } catch (error) {
      console.error("Exception making user admin:", error);
    }
  };

  if (loading || checkingPermissions) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <p className="text-muted-foreground text-xl">
              {loading ? "Verifying your account..." : "Checking database access..."}
            </p>
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dbAccessible) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="max-w-5xl mx-auto p-6 bg-card rounded-md shadow">
            <h1 className="text-3xl font-bold mb-6">Database Connection Error</h1>
            <p className="mb-4">
              Unable to connect to the database or access the necessary tables. This might be due to:
            </p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>Network connectivity issues</li>
              <li>Database permission problems</li>
              <li>Row-level security policies preventing access</li>
            </ul>
            
            <div className="space-y-4">
              <Button onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
              
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Debug Info: User ID: {user?.id || "Not logged in"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="max-w-5xl mx-auto p-6 bg-card rounded-md shadow">
            <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
            <p className="mb-6">
              You don't have admin privileges to access this page.
            </p>
            
            {user && (
              <Button onClick={makeUserAdmin}>
                Make Me Admin
              </Button>
            )}
            
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                User ID: {user?.id || "Not logged in"}
              </p>
              <p className="text-sm text-muted-foreground">
                Current Role: {user?.role || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button 
              onClick={() => refreshUserRole()}
              variant="outline"
            >
              Refresh Permissions
            </Button>
          </div>
          
          <div className="p-6 bg-card rounded-md shadow">
            <UserManagementTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
