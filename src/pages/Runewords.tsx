
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Runeword, GameType } from "@/types/items";
import Navigation from "@/components/Navigation";
import RunewordCard from "@/components/RunewordCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Runewords = () => {
  const [gameFilter, setGameFilter] = useState<GameType>("diablo2_resurrected");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [baseTypeFilter, setBaseTypeFilter] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Log connectivity test for debugging
    console.log("Runewords page mounted - Testing Supabase connection...");
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from("runewords").select("id").limit(1);
        if (error) {
          console.error("Supabase connection test failed:", error);
          toast({
            variant: "destructive",
            title: "Database Connection Error",
            description: "Failed to connect to the database. Please try again later.",
          });
        } else {
          console.log("Supabase connection test successful:", data);
        }
      } catch (err) {
        console.error("Unexpected error during connection test:", err);
      }
    };
    
    testConnection();
  }, [toast]);

  const { data: runewords = [], isLoading, error } = useQuery({
    queryKey: ["runewords", gameFilter, searchTerm, levelFilter, baseTypeFilter],
    queryFn: async () => {
      console.log("Fetching runewords with filters:", { gameFilter, searchTerm, levelFilter, baseTypeFilter });
      
      try {
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
          throw error;
        }
        
        console.log("Successfully fetched runewords:", data?.length || 0);
        return data as Runeword[];
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 60000,
  });

  // Show error state if query failed
  if (error) {
    console.error("React Query error:", error);
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Runewords</h2>
            <p className="text-gray-300 mb-6">
              Failed to load runewords from the database. Please try refreshing the page.
            </p>
            <pre className="text-left bg-black/30 p-4 rounded max-w-2xl mx-auto overflow-auto text-xs text-red-300">
              {(error as Error).message}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Runewords Database</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-secondary/30 p-6 rounded-lg space-y-4">
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
              <div className="text-center py-8">
                <p className="text-gray-300 mb-2">Loading runewords...</p>
                <p className="text-gray-500 text-sm">
                  Connecting to Supabase and fetching data...
                </p>
              </div>
            ) : runewords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-2">No runewords found with the current filters.</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or check back later.
                </p>
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
