
const HeroSection = () => {
  return (
    <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-background/95 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="container relative z-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-diablo-500">Diablo Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join our thriving community of Diablo players. Trade items, share strategies,
            and connect with fellow adventurers.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-diablo-600 hover:bg-diablo-700 text-white px-8 py-3 rounded-lg transition-colors">
              Join Community
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors">
              Browse Trades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
