
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PaymentSection from "@/components/trade/PaymentSection";
import GameSettings from "@/components/trade/GameSettings";
import ItemSelection from "@/components/trade/ItemSelection";
import { GameType, PlatformType, GameModeType, LadderType, PaymentType } from "@/types/trading";

const CreateTrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [game, setGame] = useState<GameType>("diablo2_resurrected");
  const [platform, setPlatform] = useState<PlatformType>("pc");
  const [gameMode, setGameMode] = useState<GameModeType>("softcore");
  const [ladderStatus, setLadderStatus] = useState<LadderType>("non_ladder");
  const [paymentType, setPaymentType] = useState<PaymentType>("currency");
  const [paymentItems, setPaymentItems] = useState("");

  useEffect(() => {
    setGameMode('softcore');
    setLadderStatus(game === 'diablo2_resurrected' ? 'non_ladder' : 'not_applicable');
    setSelectedItem(""); // Reset selected item when game changes
  }, [game]);

  const handleItemSelect = (itemName: string, customProperties?: string) => {
    console.log("Selected item:", itemName, "Properties:", customProperties);
    setSelectedItem(itemName);
    setTitle(`Selling ${itemName}`);
    if (customProperties) {
      setDescription(customProperties);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a trade.",
      });
      return;
    }
    
    setLoading(true);

    try {
      console.log("Creating trade with data:", {
        user_id: user.id,
        title,
        description,
        game,
        platform,
        game_mode: gameMode,
        ladder_status: ladderStatus,
        price: paymentType === 'currency' && price ? parseFloat(price) : null,
        payment_type: paymentType,
        payment_items: paymentType === 'items' ? paymentItems : null,
      });
      
      const { data, error } = await supabase.from("trades").insert({
        user_id: user.id,
        title,
        description,
        game,
        platform,
        game_mode: gameMode,
        ladder_status: ladderStatus,
        price: paymentType === 'currency' && price ? parseFloat(price) : null,
        payment_type: paymentType,
        payment_items: paymentType === 'items' ? paymentItems : null,
        status: "active",
      }).select();

      if (error) {
        console.error("Error creating trade:", error);
        throw error;
      }

      console.log("Trade created successfully:", data);
      
      toast({
        title: "Success",
        description: "Your trade has been listed!",
      });
      navigate("/market");
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create trade",
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
          <h1 className="text-3xl font-bold text-white mb-8">List an Item</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Select Item</Label>
              <ItemSelection 
                gameType={game}
                onItemSelect={handleItemSelect}
                selectedItem={selectedItem}
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you selling?"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                required
              />
            </div>

            <PaymentSection
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              price={price}
              setPrice={setPrice}
              paymentItems={paymentItems}
              setPaymentItems={setPaymentItems}
            />

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
                disabled={loading || !selectedItem}
              >
                {loading ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrade;
