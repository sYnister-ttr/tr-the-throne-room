
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Log the authentication state for debugging
  useEffect(() => {
    console.log("ProtectedRoute - Auth State:", { user: user?.id, loading });
    
    // If loading is done and there's no user, redirect to login
    if (!loading && !user) {
      console.log("ProtectedRoute - Redirecting to login");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-400">Loading authentication...</div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/login" />;
  }

  console.log("ProtectedRoute - User authenticated, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
