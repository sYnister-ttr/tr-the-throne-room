
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, checkTableAccess } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import RunewordCard from "@/components/RunewordCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Runeword } from "@/types/items";

const Runewords = () => {
  const [gameFilter, setGameFilter] = useState<string>("diablo2_resurrected");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [baseTypeFilter, setBaseTypeFilter] = useState<string>("");
  const [accessError, setAccessError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAccess() {
      const hasAccess = await checkTableAccess("runewords");
      if (!hasAccess) {
        setAccessError("Unable to access runewords data. Please check Supabase RLS policies.");
      } else {
        setAccessError(null);
      }
    }
    
    checkAccess();
  }, []);

  const { data: runewords = [], isLoading } = useQuery({
    queryKey: ["runewords", gameFilter, searchTerm, levelFilter, baseTypeFilter],
    queryFn: async () => {
      console.log("Fetching runewords with filters:", { gameFilter, searchTerm, levelFilter, baseTypeFilter });
      
      let query = supabase
        .from("runewords")
        .select("*");
      
      if (gameFilter && gameFilter !== "all") {
        query = query.eq("game", gameFilter);
      }
      
      if (searchTerm.trim() !== "") {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      if (levelFilter) {
        query = query.lte("required_level", levelFilter);
      }
      
      if (baseTypeFilter.trim() !== "") {
        // This assumes base_types is an array in the database
        query = query.contains("base_types", [baseTypeFilter.trim()]);
      }
      
      const { data, error } = await query.order("name");
      
      if (error) {
        console.error("Error fetching runewords:", error);
        setAccessError(`Error fetching runewords: ${error.message}`);
        return [];
      }
      
      console.log(`Successfully fetched ${data?.length || 0} runewords`);
      return data as Runeword[];
    },
    enabled: !accessError, // Only run the query if we have access
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Runewords Database</h1>
          <Button 
            onClick={() => navigate("/runewords/add")}
            className="bg-diablo-600 hover:bg-diablo-700"
          >
            Add Runeword
          </Button>
        </div>
        
        {accessError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {accessError}
              <p className="text-sm mt-2">
                This is likely due to Supabase Row Level Security (RLS) policies.
                You may need to enable public read access to the runewords table.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-secondary/30 p-6 rounded-lg space-y-4">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Select
                  value={gameFilter}
                  onValueChange={(value) => setGameFilter(value)}
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
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading runewords...</p>
              </div>
            ) : runewords.length === 0 && !accessError ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No runewords found with the current filters.</p>
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
