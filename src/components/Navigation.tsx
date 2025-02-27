
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed w-full bg-black/80 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-white font-bold text-xl hover:text-diablo-500 transition"
              >
                TR Admin
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/market"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Market
                </Link>
                <Link
                  to="/price-check"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Price Check
                </Link>
                <Link
                  to="/items"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Items
                </Link>
                <Link
                  to="/runewords"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Runewords
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-diablo-500 hover:text-diablo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Shield className="mr-1 h-4 w-4" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-white flex items-center"
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-diablo-500 text-diablo-500 hover:bg-diablo-500 hover:text-white"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-diablo-500 text-diablo-500 hover:bg-diablo-500 hover:text-white"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-diablo-500 hover:bg-diablo-700"
                    onClick={() => navigate("/register")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/market"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Market
            </Link>
            <Link
              to="/price-check"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Price Check
            </Link>
            <Link
              to="/items"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Items
            </Link>
            <Link
              to="/runewords"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Runewords
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-diablo-500 hover:text-diablo-400 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                onClick={toggleMenu}
              >
                <Shield className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
          </div>
          <Separator />
          <div className="pt-4 pb-3 border-gray-800">
            <div className="flex items-center px-5">
              {user ? (
                <div className="flex flex-col w-full gap-2">
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-white flex items-center px-3 py-2"
                    onClick={toggleMenu}
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-diablo-500 text-diablo-500 hover:bg-diablo-500 hover:text-white w-full"
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col w-full gap-2">
                  <Button
                    variant="outline"
                    className="border-diablo-500 text-diablo-500 hover:bg-diablo-500 hover:text-white w-full"
                    onClick={() => {
                      navigate("/login");
                      toggleMenu();
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-diablo-500 hover:bg-diablo-700 w-full"
                    onClick={() => {
                      navigate("/register");
                      toggleMenu();
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
