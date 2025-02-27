
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Runeword, GameType } from "@/types/items";
import Navigation from "@/components/Navigation";
import RunewordCard from "@/components/RunewordCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Runewords = () => {
  const [gameFilter, setGameFilter] = useState<GameType>("diablo2_resurrected");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [baseTypeFilter, setBaseTypeFilter] = useState<string>("");

  const { data: runewords = [], isLoading } = useQuery({
    queryKey: ["runewords", gameFilter, searchTerm, levelFilter, baseTypeFilter],
    queryFn: async () => {
      console.log("Fetching runewords with filters:", { gameFilter, searchTerm, levelFilter, baseTypeFilter });
      
      let query = supabase
        .from("runewords")
        .select("*")
        .eq("game", gameFilter);
      
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      if (levelFilter) {
        query = query.lte("required_level", levelFilter);
      }
      
      if (baseTypeFilter) {
        query = query.contains("base_types", [baseTypeFilter]);
      }
      
      const { data, error } = await query.order("name");
      
      if (error) {
        console.error("Error fetching runewords:", error);
        return [];
      }
      
      return data as Runeword[];
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-white mb-8">Runewords Database</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-secondary p-6 rounded-lg space-y-4">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Select
                  value={gameFilter}
                  onValueChange={(value) => setGameFilter(value as GameType)}
                >
                  <SelectTrigger id="game" className="bg-background">
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diablo2_resurrected">Diablo II: Resurrected</SelectItem>
                    <SelectItem value="diablo4">Diablo IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">Search by name</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search runewords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLevel">Maximum Level</Label>
                <Input
                  id="maxLevel"
                  type="number"
                  placeholder="Any level"
                  value={levelFilter || ""}
                  onChange={(e) => setLevelFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="baseType">Base Item Type</Label>
                <Input
                  id="baseType"
                  type="text"
                  placeholder="Any base type"
                  value={baseTypeFilter}
                  onChange={(e) => setBaseTypeFilter(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-8">Loading runewords...</div>
            ) : runewords.length === 0 ? (
              <div className="text-center py-8">
                No runewords found with the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {runewords.map((runeword) => (
                  <RunewordCard key={runeword.id} runeword={runeword} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Runewords;
