
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ItemCard from "@/components/ItemCard";
import { ItemCategory, GameType } from "@/types/items";
import ItemFilters from "@/components/ItemFilters";
import { useToast } from "@/components/ui/use-toast";

const ItemDatabase = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    game: "diablo4" as GameType,
    category: "" as ItemCategory | "",
    minLevel: "",
    maxLevel: "",
  });

  // Fetch items with filtering
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", filters, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("items")
        .select("*")
        .eq("game", filters.game)
        .ilike("name", `%${searchTerm}%`);

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.minLevel) {
        query = query.gte("level_req", parseInt(filters.minLevel));
      }

      if (filters.maxLevel) {
        query = query.lte("level_req", parseInt(filters.maxLevel));
      }

      const { data, error } = await query.order("name");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching items",
          description: error.message,
        });
        return [];
      }
      
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-diablo-500 mb-6 drop-shadow-[0_0_10px_rgba(255,61,61,0.3)] uppercase tracking-wider">
          Item Database
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-secondary p-6 rounded-lg">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="search" className="text-white font-semibold mb-2 block">
                    Search Items
                  </label>
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-diablo-600 hover:bg-diablo-700"
                >
                  Search
                </Button>
              </form>
            </div>

            <ItemFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-secondary animate-pulse h-64 rounded-lg"></div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="bg-secondary p-8 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">No items found</h3>
                <p className="text-gray-400">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDatabase;
