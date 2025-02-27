
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCog, RefreshCw, ShieldAlert } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, refreshUserRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Admin page loaded with user:", user?.id);
    console.log("Current isAdmin status:", isAdmin);
  }, [user, isAdmin]);

  const makeUserAdmin = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user is logged in",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Making user admin:", user.id);
      
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log("Existing role check:", existingRole, checkError);

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        console.log("Updated role to admin");
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });

        if (insertError) throw insertError;
        console.log("Inserted new admin role");
      }

      await refreshUserRole();
      
      toast({
        title: "Success",
        description: "You are now an admin!",
      });
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({
        title: "Error",
        description: "Failed to set admin role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserCog className="h-6 w-6 text-diablo-500" />
            <h1 className="text-3xl font-bold text-white">Admin Panel Setup</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Admin Status:</strong> {isAdmin ? 'Yes (Admin)' : 'No (Not Admin)'}</p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={makeUserAdmin} 
                disabled={loading}
                className="gap-2"
              >
                <ShieldAlert className="h-4 w-4" />
                Make Me Admin
              </Button>
              
              <Button 
                variant="outline" 
                onClick={refreshUserRole} 
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Role
              </Button>
            </div>
            
            {!isAdmin && (
              <div className="text-amber-500 mt-4">
                <p>You need admin privileges to access the full admin panel.</p>
                <p>Click the "Make Me Admin" button to grant yourself admin access.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <div className="text-green-500 p-4 border border-green-500 rounded-md">
            <p className="font-bold">You now have admin access!</p>
            <p>Refresh the page to access the full admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
