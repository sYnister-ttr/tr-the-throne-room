
import { Button } from "@/components/ui/button";
import { Discord } from "lucide-react";

const HeroSection = () => {
  return (
    <div 
      className="relative h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/lovable-uploads/0014e644-5504-47fe-8e56-2307ddb5a30e.png')`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-background z-10" />
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to TR The Throne Room
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Your ultimate destination for Diablo trading and community
          </p>
          <Button
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center gap-2"
            onClick={() => window.open('https://discord.gg/kTYCSbgGgH', '_blank')}
          >
            <Discord className="w-5 h-5" />
            Join our Discord Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
