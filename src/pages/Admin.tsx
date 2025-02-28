
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, BarChart3, ShieldAlert } from "lucide-react";

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="flex justify-center items-center h-[60vh]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect due to the useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-diablo-500" />
              <span className="text-diablo-500 font-medium">Admin Access</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-diablo-500" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View all registered users, assign roles, and manage permissions.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/admin/users">Manage Users</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-diablo-500" />
                  Site Analytics
                </CardTitle>
                <CardDescription>
                  Review site usage and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View detailed analytics about site usage, popular content, and user engagement.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" disabled>Coming Soon</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-diablo-500" />
                  Site Settings
                </CardTitle>
                <CardDescription>
                  Configure application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage application-wide settings, feature flags, and system configurations.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" disabled>Coming Soon</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
