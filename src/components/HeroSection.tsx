
const HeroSection = () => {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-background z-10" />
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to TR The Throne Room
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Your ultimate destination for Diablo trading and community
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
