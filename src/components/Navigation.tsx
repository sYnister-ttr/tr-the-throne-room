
import { Button } from "@/components/ui/button";
import { Shield, ShoppingCart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-diablo-500 font-semibold text-xl">
              TR The Throne Room
            </a>
            <div className="hidden md:flex space-x-4">
              <a href="/market" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Market
              </a>
              <a href="/community" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" />
                Community
              </a>
              <a href="/guides" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Guides
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-diablo-600 hover:bg-diablo-700 text-white"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
