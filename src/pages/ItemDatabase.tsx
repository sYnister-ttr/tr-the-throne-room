
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import ItemCard from "@/components/ItemCard";
import ItemFilters from "@/components/ItemFilters";
import { Item, GameType, ItemCategory, ItemRarity } from "@/types/items";

const ItemDatabase = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [gameFilter, setGameFilter] = useState<GameType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | "all">("all");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", searchTerm, gameFilter, categoryFilter, rarityFilter, levelFilter],
    queryFn: async () => {
      console.log("Fetching items with filters:", { searchTerm, gameFilter, categoryFilter, rarityFilter, levelFilter });
      
      let query = supabase.from("items").select("*");
      
      if (searchTerm.trim() !== "") {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      if (gameFilter && gameFilter !== "all") {
        query = query.eq("game", gameFilter);
      }
      
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      
      if (rarityFilter && rarityFilter !== "all") {
        query = query.eq("rarity", rarityFilter);
      }
      
      if (levelFilter) {
        query = query.lte("required_level", levelFilter);
      }
      
      const { data, error } = await query.order("name");
      
      if (error) {
        console.error("Error fetching items:", error);
        return [];
      }
      
      return data as Item[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-white mb-8">Item Database</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ItemFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              gameFilter={gameFilter}
              setGameFilter={setGameFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              rarityFilter={rarityFilter}
              setRarityFilter={setRarityFilter}
              levelFilter={levelFilter}
              setLevelFilter={setLevelFilter}
            />
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-8">Loading items...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                No items found with the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDatabase;
