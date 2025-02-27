
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      console.log("ProtectedRoute check - User:", user?.id);
      console.log("ProtectedRoute check - IsAdmin:", isAdmin);
      console.log("ProtectedRoute check - RequireAdmin:", requireAdmin);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access this page.",
          variant: "destructive",
        });
      } else if (requireAdmin && !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
      }
    }
  }, [loading, user, requireAdmin, isAdmin, toast]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-diablo-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log("Access denied - User is not an admin");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
