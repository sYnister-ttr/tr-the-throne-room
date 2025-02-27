
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useMobile from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      // Set initials from username or email if available
      if (user.user_metadata?.username) {
        const username = user.user_metadata.username;
        setInitials(username.substring(0, 2).toUpperCase());
      } else if (user.email) {
        setInitials(user.email.substring(0, 2).toUpperCase());
      }
      
      // Set avatar URL if available
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    }
  }, [user]);

  const NavLinks = () => (
    <>
      <Link to="/">
        <Button 
          variant="link" 
          className={`text-white hover:text-diablo-500 ${location.pathname === "/" ? "text-diablo-500" : ""}`}
        >
          Home
        </Button>
      </Link>
      <Link to="/market">
        <Button 
          variant="link" 
          className={`text-white hover:text-diablo-500 ${location.pathname.includes("/market") ? "text-diablo-500" : ""}`}
        >
          Trade Market
        </Button>
      </Link>
      <Link to="/items">
        <Button 
          variant="link" 
          className={`text-white hover:text-diablo-500 ${location.pathname.includes("/items") ? "text-diablo-500" : ""}`}
        >
          Item Database
        </Button>
      </Link>
      {user && (
        <>
          <Link to="/profile">
            <Button 
              variant="link" 
              className={`text-white hover:text-diablo-500 ${location.pathname === "/profile" ? "text-diablo-500" : ""}`}
            >
              Profile
            </Button>
          </Link>
          {user.email === "admin@example.com" && (
            <Link to="/admin">
              <Button 
                variant="link" 
                className={`text-white hover:text-diablo-500 ${location.pathname === "/admin" ? "text-diablo-500" : ""}`}
              >
                Admin
              </Button>
            </Link>
          )}
        </>
      )}
    </>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <Link to="/profile">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="bg-diablo-500">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-diablo-500 text-diablo-500 hover:bg-diablo-500 hover:text-white"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-white hover:text-diablo-500">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              size="sm" 
              className="bg-diablo-500 hover:bg-diablo-600 text-white"
            >
              Register
            </Button>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-diablo-500">
              DiabloTrader
            </Link>
          </div>

          {isMobile ? (
            <>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-background border-diablo-700">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavLinks />
                    <div className="pt-4">
                      <AuthButtons />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <nav className="flex items-center space-x-1">
                <NavLinks />
              </nav>
              <AuthButtons />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
