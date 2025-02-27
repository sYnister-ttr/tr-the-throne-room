
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GameSettings from "@/components/trade/GameSettings";
import { GameType, PlatformType, GameModeType, LadderType } from "@/types/trading";

const PriceCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [game, setGame] = useState<GameType>("diablo4");
  const [platform, setPlatform] = useState<PlatformType>("pc");
  const [gameMode, setGameMode] = useState<GameModeType>("softcore");
  const [ladderStatus, setLadderStatus] = useState<LadderType>("not_applicable");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('price_checks')
        .insert({
          user_id: user.id,
          item_name: itemName,
          description: description || null, // Make description optional
          game,
          platform,
          game_mode: gameMode,
          ladder_status: ladderStatus,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your price check has been posted!",
      });
      navigate("/market");
    } catch (error: any) {
      console.error('Error creating price check:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Request a Price Check</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="What item do you want to price check?"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any relevant details about the item..."
              />
            </div>

            <GameSettings
              game={game}
              setGame={setGame}
              platform={platform}
              setPlatform={setPlatform}
              gameMode={gameMode}
              setGameMode={setGameMode}
              ladderStatus={ladderStatus}
              setLadderStatus={setLadderStatus}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/market")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-diablo-600 hover:bg-diablo-700"
                disabled={loading}
              >
                {loading ? "Creating..." : "Submit Price Check"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PriceCheck;
