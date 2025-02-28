
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Runeword, GameType } from "@/types/items";
import Navigation from "@/components/Navigation";
import RunewordCard from "@/components/RunewordCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Runewords = () => {
  const [gameFilter, setGameFilter] = useState<GameType>("diablo2_resurrected");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [baseTypeFilter, setBaseTypeFilter] = useState<string>("");
  const { toast } = useToast();

  // Simplified query without authentication dependencies
  const { 
    data: runewords = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["runewords", gameFilter, searchTerm, levelFilter, baseTypeFilter],
    queryFn: async () => {
      try {
        console.log("Fetching runewords with filters:", { 
          gameFilter, searchTerm, levelFilter, baseTypeFilter 
        });
        
        let query = supabase
          .from("runewords")
          .select("*");
        
        if (gameFilter) {
          query = query.eq("game", gameFilter);
        }
        
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
          console.error("Supabase query error:", error);
          throw error;
        }
        
        return data as Runeword[];
      } catch (error) {
        console.error("Error fetching runewords:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 60000,
  });

  const handleTestConnection = async () => {
    try {
      toast({
        title: "Testing connection...",
        description: "Attempting to connect to the database",
      });
      
      const { data, error } = await supabase
        .from("runewords")
        .select("id, name")
        .limit(3);
      
      if (error) {
        console.error("Test connection error:", error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Connection Successful",
        description: `Found ${data.length} records`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Runewords Database</h1>
          <Button onClick={handleTestConnection} variant="outline">
            Test Connection
          </Button>
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
              
              <Button 
                onClick={() => refetch()} 
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Runewords</h3>
                <p className="text-gray-300 mb-4">
                  There was a problem connecting to the database.
                </p>
                <pre className="text-left bg-black/30 p-4 rounded max-w-full mx-auto overflow-auto text-xs text-red-300 mb-4">
                  {error instanceof Error ? error.message : String(error)}
                </pre>
                <div className="flex justify-center gap-2">
                  <Button 
                    onClick={() => refetch()}
                    variant="destructive"
                  >
                    Retry
                  </Button>
                  <Button 
                    onClick={handleTestConnection}
                    variant="outline"
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12 bg-gray-800/20 rounded-lg border border-gray-700">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-diablo-500" />
                <p className="text-gray-300 mb-2">Loading runewords...</p>
                <p className="text-gray-500 text-sm">
                  Connecting to Supabase and fetching data...
                </p>
              </div>
            ) : runewords.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/20 rounded-lg border border-gray-700">
                <p className="text-gray-300 mb-2">No runewords found with the current filters.</p>
                <p className="text-gray-500 text-sm mb-4">
                  Try adjusting your filters or check back later.
                </p>
                <Button 
                  onClick={() => {
                    setGameFilter("diablo2_resurrected");
                    setSearchTerm("");
                    setLevelFilter(null);
                    setBaseTypeFilter("");
                    refetch();
                  }}
                >
                  Reset Filters
                </Button>
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
