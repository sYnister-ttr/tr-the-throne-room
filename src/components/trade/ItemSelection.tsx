
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameType, Item, Runeword } from "@/types/items";
import { Textarea } from "@/components/ui/textarea";

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

  // Reset search and custom properties when game changes
  useEffect(() => {
    setSearchTerm("");
    setCustomProperties("");
    setSelectedItemType("");
  }, [gameType]);

  // Fetch items and runewords for the selected game
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["items-runewords-search", gameType, searchTerm],
    queryFn: async () => {
      console.log("Fetching items and runewords for game:", gameType);
      
      try {
        // Fetch items
        const { data: items = [], error: itemsError } = await supabase
          .from("items")
          .select("*")
          .eq("game", gameType)
          .ilike("name", `%${searchTerm}%`)
          .limit(20);
          
        if (itemsError) throw itemsError;

        // Fetch runewords
        const { data: runewords = [], error: runewordsError } = await supabase
          .from("runewords")
          .select("*")
          .eq("game", gameType)
          .ilike("name", `%${searchTerm}%`)
          .limit(20);
          
        if (runewordsError) throw runewordsError;

        // Combine and format results
        const formattedItems = items.map((item: Item) => ({
          ...item,
          itemType: item.rarity === 'normal' ? 'base' : item.rarity
        }));

        const formattedRunewords = runewords.map((runeword: Runeword) => ({
          id: runeword.id,
          name: runeword.name,
          itemType: 'runeword',
          category: 'runeword',
          base_types: runeword.base_types
        }));

        return [...formattedItems, ...formattedRunewords];
      } catch (error) {
        console.error("Exception fetching items:", error);
        return [];
      }
    },
    enabled: searchTerm.length > 0
  });

  const handleItemSelect = (item: any) => {
    setSelectedItemType(item.itemType);
    
    if (item.itemType === 'base' || item.itemType === 'magic' || item.itemType === 'rare') {
      // For base, magic, and rare items, show custom properties input
      setCustomProperties("");
    } else {
      // For unique, set, and runeword items, clear custom properties
      setCustomProperties("");
      onItemSelect(item.name);
    }
    
    setSearchTerm(item.name);
    setOpen(false);
  };

  const handleCustomPropertiesSubmit = () => {
    onItemSelect(searchTerm, customProperties);
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
              placeholder="Search items..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No items found."}
              </CommandEmpty>
              <CommandGroup>
                {searchResults.map((item) => (
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
                        {item.itemType}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Custom Properties Input for Base/Magic/Rare Items */}
      {selectedItemType && (selectedItemType === 'base' || selectedItemType === 'magic' || selectedItemType === 'rare') && (
        <div className="space-y-2">
          <Label htmlFor="customProperties">
            Item Properties 
            <span className="text-sm text-muted-foreground ml-2">
              (sockets, stats, etc.)
            </span>
          </Label>
          <Textarea
            id="customProperties"
            value={customProperties}
            onChange={(e) => setCustomProperties(e.target.value)}
            placeholder="Enter item properties (e.g., '4 sockets, 15% Enhanced Defense')"
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleCustomPropertiesSubmit}
            className="w-full"
            disabled={!customProperties.trim()}
          >
            Confirm Properties
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemSelection;
