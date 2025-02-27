
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="font-bold text-xl">TR</Link>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/market">
                <Button variant="ghost">Market</Button>
              </Link>
              <Link to="/market/price-check">
                <Button variant="ghost">Price Check</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
