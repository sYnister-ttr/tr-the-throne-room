
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameType, Item } from "@/types/items";

interface ItemSelectionProps {
  gameType: GameType;
  onItemSelect: (itemName: string) => void;
  selectedItem: string;
}

const ItemSelection = ({ gameType, onItemSelect, selectedItem }: ItemSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  // Reset search when game changes
  useEffect(() => {
    setSearchTerm("");
  }, [gameType]);

  // Fetch items for the selected game
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items-selection", gameType, searchTerm],
    queryFn: async () => {
      console.log("Fetching items for game:", gameType);
      
      try {
        let query = supabase
          .from("items")
          .select("*")
          .eq("game", gameType);
        
        if (searchTerm && searchTerm.trim() !== "") {
          query = query.ilike("name", `%${searchTerm}%`);
        }

        const { data, error } = await query.order("name").limit(20);
        
        if (error) {
          console.error("Error fetching items:", error);
          return [];
        }
        
        console.log("Items fetched:", data?.length || 0, data);
        return data as Item[];
      } catch (error) {
        console.error("Exception fetching items:", error);
        return [];
      }
    },
    // Always fetch some initial items, even without search term
    enabled: true
  });

  const handleItemSelect = (item: Item) => {
    onItemSelect(item.name);
    setSearchTerm(item.name);
    setOpen(false);
  };

  // Debug render - show items count
  console.log("Rendering with items:", items?.length || 0);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline" 
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => setOpen(true)}
          >
            {selectedItem || "Select an item..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search items..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No items found for this game."}
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleItemSelect(item)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedItem === item.name ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="mr-2">{item.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ItemSelection;
