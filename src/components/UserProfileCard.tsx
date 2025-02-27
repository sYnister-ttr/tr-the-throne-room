
import { Card } from "@/components/ui/card";
import { Shield, Star, Sword } from "lucide-react";

const UserProfileCard = () => {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-gray-800 p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-diablo-600/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-diablo-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">DemonSlayer</h3>
            <span className="px-2 py-1 rounded-full bg-diablo-600/20 text-diablo-500 text-xs">
              Verified Trader
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Member since 2023</p>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-diablo-500" />
              <span className="text-sm text-gray-300">4.9/5</span>
            </div>
            <div className="flex items-center gap-1">
              <Sword className="w-4 h-4 text-diablo-500" />
              <span className="text-sm text-gray-300">127 Trades</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserProfileCard;
