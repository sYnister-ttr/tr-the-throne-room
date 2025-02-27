
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { GameType, PlatformType, GameModeType, LadderType, PaymentType } from "@/types/trading";

const CreateTrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [game, setGame] = useState<GameType>("diablo4");
  const [platform, setPlatform] = useState<PlatformType>("pc");
  const [gameMode, setGameMode] = useState<GameModeType>("softcore");
  const [ladderStatus, setLadderStatus] = useState<LadderType>("not_applicable");
  const [paymentType, setPaymentType] = useState<PaymentType>("currency");
  const [paymentItems, setPaymentItems] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("trades").insert({
        user_id: user?.id,
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
      });

      if (error) {
        console.error("Error creating trade:", error);
        throw error;
      }

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
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderGameModes = () => {
    if (game === 'diablo4') {
      return (
        <>
          <SelectItem value="softcore">Softcore</SelectItem>
          <SelectItem value="hardcore">Hardcore</SelectItem>
          <SelectItem value="eternal">Eternal</SelectItem>
          <SelectItem value="seasonal">Seasonal</SelectItem>
        </>
      );
    }
    return (
      <>
        <SelectItem value="softcore">Softcore</SelectItem>
        <SelectItem value="hardcore">Hardcore</SelectItem>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">List an Item</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="space-y-4">
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={(value: PaymentType) => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">Forum Gold</SelectItem>
                  <SelectItem value="items">Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentType === 'currency' ? (
              <div>
                <Label htmlFor="price">Price (FG)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in Forum Gold"
                  required
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="paymentItems">Requested Items</Label>
                <Textarea
                  id="paymentItems"
                  value={paymentItems}
                  onChange={(e) => setPaymentItems(e.target.value)}
                  placeholder="Describe the items you want in exchange..."
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Game</Label>
                <Select value={game} onValueChange={(value: GameType) => setGame(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diablo4">Diablo 4</SelectItem>
                    <SelectItem value="diablo2_resurrected">Diablo 2: Resurrected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(value: PlatformType) => setPlatform(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pc">PC</SelectItem>
                    <SelectItem value="playstation">PlayStation</SelectItem>
                    <SelectItem value="xbox">Xbox</SelectItem>
                    <SelectItem value="nintendo_switch">Nintendo Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Game Mode</Label>
                <Select value={gameMode} onValueChange={(value: GameModeType) => setGameMode(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderGameModes()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ladder Status</Label>
                <Select value={ladderStatus} onValueChange={(value: LadderType) => setLadderStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ladder status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ladder">Ladder</SelectItem>
                    <SelectItem value="non_ladder">Non-Ladder</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
