
const FeaturedTrades = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Featured Trades</h2>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-secondary rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-white">Ancient Legendary Item</h3>
                <p className="text-sm text-gray-400">Posted 2 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-diablo-600 text-white text-sm rounded">
                Trading
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTrades;
