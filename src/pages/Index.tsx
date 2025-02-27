
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedTrades from "@/components/FeaturedTrades";
import UserProfileCard from "@/components/UserProfileCard";
import GameStatusInfo from "@/components/GameStatusInfo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <Navigation />
      <HeroSection />
      <div className="container mx-auto px-4">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-diablo-500 mb-6 drop-shadow-[0_0_10px_rgba(255,61,61,0.3)] uppercase tracking-wider">
                Featured Trades
              </h2>
              <FeaturedTrades />
              
              <div className="mt-8 flex justify-center">
                <Link to="/items">
                  <Button variant="outline" className="border-diablo-500 text-diablo-500 hover:bg-diablo-500 hover:text-white">
                    Browse Item Database
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <GameStatusInfo />
              <h2 className="text-2xl font-bold text-diablo-500 mb-4 drop-shadow-[0_0_10px_rgba(255,61,61,0.3)] uppercase tracking-wider">
                Featured Members
              </h2>
              <UserProfileCard />
              <UserProfileCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
