
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GameType } from "@/types/items";
import { Textarea } from "@/components/ui/textarea";

interface ItemSearchResult {
  id: string;
  name: string;
  itemType: string;
  category: string;
  base_types?: string[];
}

interface ItemSelectionProps {
  gameType: GameType;
  onItemSelect: (itemName: string, customProperties?: string) => void;
  selectedItem: string;
}

const ItemSelection = ({ gameType, onItemSelect, selectedItem }: ItemSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [customProperties, setCustomProperties] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<string>("");
  const [selectedItemCategory, setSelectedItemCategory] = useState<string>("");

  // Reset search and custom properties when game changes
  useEffect(() => {
    setSearchTerm("");
    setCustomProperties("");
    setSelectedItemType("");
    setSelectedItemCategory("");
  }, [gameType]);

  // Fetch items and runewords for the selected game
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["items-runewords-search", gameType, searchTerm],
    queryFn: async () => {
      console.log("Fetching items and runewords for game:", gameType, "search:", searchTerm);
      
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }
      
      try {
        // Fetch items
        const { data: items = [], error: itemsError } = await supabase
          .from("items")
          .select("id, name, category, rarity")
          .eq("game", gameType)
          .ilike("name", `%${searchTerm}%`)
          .limit(20);
          
        if (itemsError) {
          console.error("Error fetching items:", itemsError);
          throw itemsError;
        }

        console.log("Items found:", items.length);

        // Fetch runewords
        const { data: runewords = [], error: runewordsError } = await supabase
          .from("runewords")
          .select("id, name, base_types")
          .eq("game", gameType)
          .ilike("name", `%${searchTerm}%`)
          .limit(20);
          
        if (runewordsError) {
          console.error("Error fetching runewords:", runewordsError);
          throw runewordsError;
        }

        console.log("Runewords found:", runewords.length);

        // Combine and format results
        const formattedItems = items.map((item: any) => ({
          id: item.id,
          name: item.name,
          itemType: item.rarity || 'normal',
          category: item.category
        }));

        const formattedRunewords = runewords.map((runeword: any) => ({
          id: runeword.id,
          name: runeword.name,
          itemType: 'runeword',
          category: 'runeword',
          base_types: runeword.base_types
        }));

        const results = [...formattedItems, ...formattedRunewords];
        console.log("Combined results:", results.length);
        return results;
      } catch (error) {
        console.error("Exception fetching items and runewords:", error);
        return [];
      }
    },
    enabled: searchTerm.length >= 2
  });

  const handleItemSelect = (item: ItemSearchResult) => {
    console.log("Selected item:", item);
    setSelectedItemType(item.itemType);
    setSelectedItemCategory(item.category);
    
    // Always show custom properties for all items to allow for variable stats
    setCustomProperties("");
    
    setSearchTerm(item.name);
    setOpen(false);
  };

  const handleCustomPropertiesSubmit = () => {
    onItemSelect(searchTerm, customProperties);
  };

  // Determine if we should show custom properties input
  const shouldShowCustomProperties = () => {
    if (!selectedItemType) return false;
    
    // Always show for normal/magic/rare items
    if (['normal', 'magic', 'rare'].includes(selectedItemType)) return true;
    
    // Show for runewords to specify the base item used
    if (selectedItemType === 'runeword') return true;
    
    // Show for unique items to allow specifying variable stats
    if (selectedItemType === 'unique' || selectedItemType === 'set') return true;
    
    return false;
  };

  // Generate placeholder based on item type and category
  const getPlaceholder = () => {
    if (selectedItemType === 'normal') {
      if (['weapon', 'armor'].includes(selectedItemCategory)) {
        return "Enter item properties (e.g., '4 sockets, 15% Enhanced Defense, Ethereal')";
      }
      return "Enter item properties (e.g., 'Superior, +15% Enhanced Defense')";
    }
    
    if (selectedItemType === 'magic' || selectedItemType === 'rare') {
      return "Enter item affixes (e.g., 'of the Whale (+60-100 Life), 20% Faster Cast Rate')";
    }
    
    if (selectedItemType === 'runeword') {
      return "Enter base item details (e.g., 'In Archon Plate, 15% Enhanced Defense, 3 sockets')";
    }
    
    if (selectedItemType === 'unique' || selectedItemType === 'set') {
      return "Enter variable stats (e.g., 'Perfect rolls, 200% Enhanced Damage, Ethereal')";
    }
    
    return "Enter item properties";
  };

  // Get custom prompt text based on item type
  const getCustomPropertiesLabel = () => {
    if (selectedItemType === 'runeword') {
      return "Base Item Details";
    }
    if (selectedItemType === 'unique' || selectedItemType === 'set') {
      return "Variable Stats";
    }
    return "Item Properties";
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline" 
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedItem || "Select an item..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search items (min 2 characters)..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : searchTerm.length < 2 ? "Type at least 2 characters to search" : "No items found."}
              </CommandEmpty>
              <CommandGroup>
                {searchResults.map((item: ItemSearchResult) => (
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
                    <div>
                      <span className="mr-2">{item.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.itemType === 'normal' ? 'base' : item.itemType}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Custom Properties Input */}
      {shouldShowCustomProperties() && (
        <div className="space-y-2">
          <Label htmlFor="customProperties">
            {getCustomPropertiesLabel()}
            <span className="text-sm text-muted-foreground ml-2">
              (variable stats, sockets, etc.)
            </span>
          </Label>
          <Textarea
            id="customProperties"
            value={customProperties}
            onChange={(e) => setCustomProperties(e.target.value)}
            placeholder={getPlaceholder()}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleCustomPropertiesSubmit}
            className="w-full"
          >
            {customProperties.trim() ? "Confirm Properties" : "Skip Properties"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemSelection;
