
import { Card } from "@/components/ui/card";

const FeaturedTrades = () => {
  const trades = [
    {
      id: 1,
      item: "Enigma Runeword",
      game: "Diablo 2",
      price: "2 High Runes",
      seller: "NecroMaster",
    },
    {
      id: 2,
      item: "Ancient's Pledge",
      game: "Diablo 4",
      price: "50,000 Gold",
      seller: "PaladinPro",
    },
    {
      id: 3,
      item: "Breath of the Dying",
      game: "Diablo 2",
      price: "Negotiable",
      seller: "BarbarianKing",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-black">
      <div className="container">
        <h2 className="text-2xl font-bold text-white mb-8">Featured Trades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trades.map((trade) => (
            <Card key={trade.id} className="bg-black/50 backdrop-blur-sm border border-gray-800 p-6 hover:border-diablo-600 transition-colors">
              <div className="flex flex-col h-full">
                <div className="text-sm text-gray-400">{trade.game}</div>
                <h3 className="text-xl font-semibold text-white mt-2">{trade.item}</h3>
                <div className="mt-4 text-gray-300">{trade.price}</div>
                <div className="mt-2 text-sm text-gray-400">Seller: {trade.seller}</div>
                <button className="mt-4 w-full bg-diablo-600/20 hover:bg-diablo-600 text-diablo-500 hover:text-white py-2 rounded transition-colors">
                  View Trade
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrades;
