
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Trade } from "@/types/trading";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface PriceCheck {
  id: string;
  item_name: string;
  game: string;
  created_at: string;
  responses_count: number;
  profiles: {
    username: string;
  };
}

const FeaturedTrades = () => {
  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['featured-trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          profiles (username)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Trade[];
    },
  });

  const { data: priceChecks = [], isLoading: priceChecksLoading } = useQuery({
    queryKey: ['featured-price-checks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_checks')
        .select(`
          *,
          profiles (username)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as PriceCheck[];
    },
  });

  if (tradesLoading || priceChecksLoading) {
    return <div>Loading featured content...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Trades</h2>
        <div className="grid gap-4">
          {trades.length === 0 ? (
            <p className="text-gray-400">No trades available</p>
          ) : (
            trades.map((trade) => (
              <Link 
                key={trade.id} 
                to={`/market/trade/${trade.id}`}
                className="block p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{trade.title}</h3>
                    <p className="text-sm text-gray-400">
                      Posted {formatDistanceToNow(new Date(trade.created_at))} ago by{" "}
                      {trade.profiles?.username}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-diablo-600 text-white text-sm rounded">
                    {trade.payment_type === 'currency' 
                      ? `${trade.price} FG` 
                      : 'Item Trade'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Price Checks</h2>
        <div className="grid gap-4">
          {priceChecks.length === 0 ? (
            <p className="text-gray-400">No price checks available</p>
          ) : (
            priceChecks.map((check) => (
              <Link 
                key={check.id} 
                to={`/price-check/${check.id}`}
                className="block p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{check.item_name}</h3>
                    <p className="text-sm text-gray-400">
                      Posted {formatDistanceToNow(new Date(check.created_at))} ago by{" "}
                      {check.profiles?.username}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-diablo-600 text-white text-sm rounded">
                    {check.responses_count} {check.responses_count === 1 ? 'response' : 'responses'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedTrades;
