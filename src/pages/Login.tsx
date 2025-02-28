
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistSession, setPersistSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUserRole } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to login with email:", email);
      
      // Set session configuration based on user preference
      await supabase.auth.setSession({
        access_token: null,
        refresh_token: null,
      });
      
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session expiry to 8 hours or 30 days based on user preference
          expiresIn: persistSession ? 30 * 24 * 60 * 60 : 8 * 60 * 60
        }
      });

      if (signInError) {
        console.error("Login error:", signInError);
        throw signInError;
      }

      console.log("Login successful, session:", data.session);
      
      // Refresh user role immediately after login
      if (data.user) {
        try {
          await refreshUserRole();
        } catch (roleError) {
          console.error("Error fetching user role:", roleError);
          // Continue with login even if role fetch fails
        }
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/");
    } catch (err: any) {
      console.error("Error during login:", err);
      
      // Provide more user-friendly error messages
      let errorMessage = "An error occurred during login";
      
      if (err.message === "Invalid login credentials") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.message?.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    toast({
      title: "Guest access",
      description: "Continuing as guest. Some features will be limited.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 bg-black/80 p-8 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={persistSession}
                onChange={(e) => setPersistSession(e.target.checked)}
                className="rounded border-gray-700 bg-black/50 text-diablo-600"
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-diablo-600 hover:bg-diablo-700"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <Button
                variant="link"
                className="text-diablo-500 hover:text-diablo-400 p-0"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
            
            <Button
              variant="link"
              className="text-gray-500 hover:text-gray-400 text-sm p-0"
              onClick={handleGuestLogin}
            >
              Continue as guest
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
