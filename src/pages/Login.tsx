
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/HeroSection";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Login error:", signInError);
        throw signInError;
      }

      console.log("Login successful, session:", data.session);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/");
    } catch (err: any) {
      console.error("Error during login:", err);
      setError(err.message || "An error occurred during login");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to log in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <HeroSection />
        <div className="absolute inset-0 flex items-center justify-center px-4 z-30">
          <div className="w-full max-w-md space-y-8 bg-black/80 p-8 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-gray-400">Sign in to your account</p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
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
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-diablo-600 hover:bg-diablo-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
