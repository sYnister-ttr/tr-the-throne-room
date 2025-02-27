
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const HeroSection = () => {
  return (
    <div 
      className="relative h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url('/62ac2d94-55e7-42fe-8668-c6e83b652481.png')`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-background/50 to-background" />
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center justify-center">
        <div className="max-w-3xl animate-fade-in text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-diablo-500 mb-6 drop-shadow-[0_0_15px_rgba(255,61,61,0.3)]">
            Welcome to TR The Throne Room
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Your ultimate destination for Diablo trading and community. Join fellow players in the pursuit of legendary items and wealth.
          </p>
          <Button
            className="bg-diablo-600 hover:bg-diablo-700 text-white flex items-center gap-2 px-6 py-6 text-lg shadow-[0_0_15px_rgba(255,61,61,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,61,61,0.5)] mx-auto"
            onClick={() => window.open('https://discord.gg/kTYCSbgGgH', '_blank')}
          >
            <MessageSquare className="w-6 h-6" />
            Join our Discord Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
