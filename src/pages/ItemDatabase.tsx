
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ItemCard from "@/components/ItemCard";
import { ItemCategory, GameType, Item } from "@/types/items";
import ItemFilters from "@/components/ItemFilters";
import { useToast } from "@/components/ui/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ItemDatabase = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({
    game: "diablo4" as GameType,
    category: "" as ItemCategory | "",
    minLevel: "",
    maxLevel: "",
  });

  // Fetch items with filtering
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", filters, selectedItem || searchTerm],
    queryFn: async () => {
      const searchQuery = selectedItem || searchTerm;
      let query = supabase
        .from("items")
        .select("*")
        .eq("game", filters.game)
        .ilike("name", `%${searchQuery}%`);

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.minLevel) {
        query = query.gte("required_level", parseInt(filters.minLevel));
      }

      if (filters.maxLevel) {
        query = query.lte("required_level", parseInt(filters.maxLevel));
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

  // Fetch item suggestions as user types
  const { data: suggestionItems = [], isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ["itemSuggestions", searchTerm, filters.game],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 1) return [];

      const { data, error } = await supabase
        .from("items")
        .select("id, name, category, rarity, game")
        .eq("game", filters.game)
        .ilike("name", `%${searchTerm}%`)
        .order("name")
        .limit(10);

      if (error) {
        console.error("Error fetching suggestions:", error);
        return [];
      }
      
      return data;
    },
    enabled: searchTerm.length > 0,
  });

  // Update search results when suggestions or filters change
  useEffect(() => {
    setSearchResults(suggestionItems);
  }, [suggestionItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Force a refetch with current search term
    setSelectedItem(searchTerm);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setSelectedItem(null); // Clear selected item when filters change
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item.name);
    setSearchTerm(item.name);
    setOpen(false);
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
                  <div className="relative">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            ref={inputRef}
                            id="search"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              if (!open) setOpen(true);
                            }}
                            className="bg-background pr-10"
                            onClick={() => {
                              if (searchTerm && !open) setOpen(true);
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setOpen(!open)}
                          >
                            <ChevronsUpDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[300px]" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Search items..." 
                            value={searchTerm} 
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No items found</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                              {searchResults.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.name}
                                  onSelect={() => handleItemSelect(item)}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.name}</span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                      {item.category}
                                    </span>
                                  </div>
                                  {selectedItem === item.name && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-diablo-600 hover:bg-diablo-700"
                >
                  <Search className="mr-2 h-4 w-4" />
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
