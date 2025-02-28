
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import UserManagementTable from "@/components/UserManagementTable";

const AdminUsers = () => {
  const { isAdmin, loading, refreshUserRole } = useAuth();
  const navigate = useNavigate();

  // Refresh user role when component mounts
  useEffect(() => {
    refreshUserRole();
  }, [refreshUserRole]);

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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">User Management</h1>
          
          <div className="p-6 bg-card rounded-md shadow">
            <UserManagementTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
