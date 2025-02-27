
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedTrades from "@/components/FeaturedTrades";
import UserProfileCard from "@/components/UserProfileCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <Navigation />
      <HeroSection />
      <div className="container mx-auto px-4">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <FeaturedTrades />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Featured Members</h2>
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
