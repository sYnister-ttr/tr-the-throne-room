
const HeroSection = () => {
  return (
    <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-background/95 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.blz-contentstack.com/v3/assets/blt45749e0fed8aa592/blt5558ea72c6f0cc25/64aef436593b3d103d62a634/D2R_S4_Social_1920x1080.jpg')",
        }}
      />
      <div className="container relative z-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-diablo-500">TR The Throne Room</span>
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
