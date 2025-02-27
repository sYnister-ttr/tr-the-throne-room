
import { Trade } from "@/types/trading";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TradeCardProps {
  trade: Trade;
}

const TradeCard = ({ trade }: TradeCardProps) => {
  const navigate = useNavigate();

  const formatGameInfo = () => {
    return `${trade.game === 'diablo2_resurrected' ? 'D2R' : 'D4'} | ${trade.platform} | ${trade.game_mode} | ${trade.ladder_status}`;
  };

  return (
    <Card className="bg-black/50 border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white">{trade.title}</h3>
            <p className="text-sm text-gray-400">{formatGameInfo()}</p>
          </div>
          {trade.price && (
            <span className="text-diablo-500 font-semibold">
              ${trade.price.toFixed(2)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm line-clamp-3">{trade.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-gray-400">
          by {trade.profiles?.username || 'Unknown User'}
        </span>
        <Button
          onClick={() => navigate(`/market/trade/${trade.id}`)}
          variant="outline"
          size="sm"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TradeCard;
