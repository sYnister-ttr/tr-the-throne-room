import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameType } from "@/types/items";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ItemSearchResult {
  id: string;
  name: string;
  itemType: string;
  category: string;
  base_types?: string[];
}

interface ItemProperty {
  name: string;
  value: string;
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
  const [itemProperties, setItemProperties] = useState<ItemProperty[]>([]);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyValue, setNewPropertyValue] = useState("");
  const [isEthereal, setIsEthereal] = useState(false);

  // Reset search and properties when game changes
  useEffect(() => {
    setSearchTerm("");
    setCustomProperties("");
    setSelectedItemType("");
    setSelectedItemCategory("");
    setItemProperties([]);
    setIsEthereal(false);
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

  // Get specific property suggestions based on selected item
  const getItemSpecificProperties = () => {
    const itemName = searchTerm.toLowerCase();
    
    // Specific runewords
    if (selectedItemType === 'runeword') {
      if (itemName === 'infinity') {
        return [
          { name: "Base Item", value: "" },
          { name: "-% to Enemy Lightning Resistance", value: "" },
          { name: "Lightning Absorb", value: "" },
          { name: "Vitality", value: "" },
          { name: "Critical Strike", value: "" }
        ];
      }
      
      if (itemName === 'enigma') {
        return [
          { name: "Base Item", value: "" },
          { name: "+to Strength", value: "" },
          { name: "+% Enhanced Defense", value: "" },
          { name: "Magic Find", value: "" },
          { name: "Damage Reduced", value: "" }
        ];
      }

      if (itemName === 'call to arms') {
        return [
          { name: "Base Item", value: "" },
          { name: "Battle Command", value: "" },
          { name: "Battle Orders", value: "" },
          { name: "Battle Cry", value: "" }
        ];
      }
      
      if (itemName === 'spirit') {
        return [
          { name: "Base Item", value: "" },
          { name: "+to All Skills", value: "" },
          { name: "Faster Cast Rate", value: "" },
          { name: "Vitality", value: "" },
          { name: "Mana", value: "" }
        ];
      }
      
      if (itemName === 'grief') {
        return [
          { name: "Base Item", value: "" },
          { name: "+Damage", value: "" },
          { name: "Increased Attack Speed", value: "" },
          { name: "+to Life After Kill", value: "" }
        ];
      }
      
      // Default runeword properties
      return [
        { name: "Base Item", value: "" },
        { name: "Sockets", value: "" },
        { name: "+% Enhanced Defense", value: "" }
      ];
    }
    
    // Unique items
    if (selectedItemType === 'unique') {
      if (itemName === 'shako' || itemName === 'harlequin crest') {
        return [
          { name: "Defense", value: "" },
          { name: "+to All Skills", value: "" },
          { name: "Magic Find", value: "" },
          { name: "+to Life", value: "" },
          { name: "+to Mana", value: "" }
        ];
      }
      
      if (itemName === 'herald of zakarum' || itemName === 'hoz') {
        return [
          { name: "Enhanced Defense", value: "" },
          { name: "Blocking", value: "" },
          { name: "+to Paladin Skills", value: "" },
          { name: "Resistances", value: "" }
        ];
      }

      if (itemName.includes('oculus') || itemName.includes('occy')) {
        return [
          { name: "+to All Skills", value: "" },
          { name: "Faster Cast Rate", value: "" },
          { name: "Resistances", value: "" },
          { name: "Magic Find", value: "" }
        ];
      }
      
      if (itemName.includes('stormshield')) {
        return [
          { name: "Enhanced Defense", value: "" },
          { name: "Damage Reduction", value: "" },
          { name: "Block", value: "" },
          { name: "Cold Resistance", value: "" }
        ];
      }
      
      if (itemName.includes('titan')) {
        return [
          { name: "Enhanced Damage", value: "" },
          { name: "Amazon Skills", value: "" },
          { name: "Replenishes Quantity", value: "" },
          { name: "Strength", value: "" },
          { name: "Increased Attack Speed", value: "" }
        ];
      }
    }
    
    // Type/category based suggestions
    if (selectedItemType === 'normal') {
      if (selectedItemCategory === 'weapon') {
        return [
          { name: "Sockets", value: "" },
          { name: "Enhanced Damage", value: "" },
          { name: "Attack Rating", value: "" }
        ];
      }
      
      if (selectedItemCategory === 'armor') {
        return [
          { name: "Sockets", value: "" },
          { name: "Enhanced Defense", value: "" },
          { name: "Defense", value: "" }
        ];
      }
      
      if (selectedItemCategory === 'jewelry') {
        return [
          { name: "Resistances", value: "" },
          { name: "Faster Cast Rate", value: "" },
          { name: "Magic Find", value: "" }
        ];
      }
    }
    
    if (selectedItemType === 'magic' || selectedItemType === 'rare') {
      if (selectedItemCategory === 'weapon') {
        return [
          { name: "Enhanced Damage", value: "" },
          { name: "Attack Speed", value: "" },
          { name: "Strength", value: "" },
          { name: "Life Leech", value: "" }
        ];
      }
      
      if (selectedItemCategory === 'armor') {
        return [
          { name: "Enhanced Defense", value: "" },
          { name: "Life", value: "" },
          { name: "Resistances", value: "" },
          { name: "Faster Hit Recovery", value: "" }
        ];
      }
      
      if (selectedItemCategory === 'jewelry') {
        return [
          { name: "Faster Cast Rate", value: "" },
          { name: "Resistances", value: "" },
          { name: "Life", value: "" },
          { name: "Strength", value: "" },
          { name: "Dexterity", value: "" }
        ];
      }
    }
    
    // Default generic properties
    return [
      { name: "Defense", value: "" },
      { name: "Damage", value: "" },
      { name: "Requirements", value: "" }
    ];
  };

  // Common property suggestions that apply to many items
  const getCommonPropertySuggestions = () => {
    const commonSuggestions = [
      "Sockets", 
      "Enhanced Defense", 
      "Enhanced Damage",
      "Resistance All", 
      "Life", 
      "Mana", 
      "Strength",
      "Dexterity",
      "Faster Cast Rate",
      "Magic Find",
      "Blocking"
    ];
    
    if (selectedItemType === 'runeword') {
      return [...commonSuggestions, "Base Item Type", "+to All Skills", "Skill Level"];
    }
    
    if (selectedItemType === 'unique' || selectedItemType === 'set') {
      return [...commonSuggestions, "Variable Rolls", "Perfect Stats"];
    }
    
    return commonSuggestions;
  };

  const handleItemSelect = (item: ItemSearchResult) => {
    console.log("Selected item:", item);
    setSelectedItemType(item.itemType);
    setSelectedItemCategory(item.category);
    
    // Reset properties
    setItemProperties([]);
    setIsEthereal(false);
    setCustomProperties("");
    
    setSearchTerm(item.name);
    setOpen(false);
  };

  // Set item-specific properties when search term is confirmed
  useEffect(() => {
    if (selectedItemType && searchTerm) {
      // Add specific properties based on the selected item
      setItemProperties(getItemSpecificProperties());
    }
  }, [selectedItemType, searchTerm, selectedItemCategory]);

  const addProperty = () => {
    if (!newPropertyName.trim()) return;
    
    setItemProperties([...itemProperties, { 
      name: newPropertyName, 
      value: newPropertyValue 
    }]);
    
    setNewPropertyName("");
    setNewPropertyValue("");
  };

  const removeProperty = (index: number) => {
    const updatedProperties = [...itemProperties];
    updatedProperties.splice(index, 1);
    setItemProperties(updatedProperties);
  };

  const updatePropertyName = (index: number, name: string) => {
    const updatedProperties = [...itemProperties];
    updatedProperties[index].name = name;
    setItemProperties(updatedProperties);
  };

  const updatePropertyValue = (index: number, value: string) => {
    const updatedProperties = [...itemProperties];
    updatedProperties[index].value = value;
    setItemProperties(updatedProperties);
  };

  const handlePropertiesSubmit = () => {
    // Format all properties into a string
    let propertyText = itemProperties
      .filter(prop => prop.name && prop.value)
      .map(prop => `${prop.name}: ${prop.value}`)
      .join('\n');
    
    if (isEthereal) {
      propertyText = `Ethereal\n${propertyText}`;
    }
    
    // Add custom properties if any
    if (customProperties.trim()) {
      propertyText += '\n' + customProperties;
    }
    
    onItemSelect(searchTerm, propertyText);
  };

  const selectSuggestion = (suggestion: string) => {
    setNewPropertyName(suggestion);
  };

  // Determine if we should show properties form
  const shouldShowProperties = () => {
    return selectedItemType && [
      'normal', 'magic', 'rare', 'unique', 'set', 'runeword'
    ].includes(selectedItemType);
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

      {/* Item Properties Form */}
      {shouldShowProperties() && (
        <div className="space-y-4 p-4 border rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Item Properties</h3>
            {(['weapon', 'armor'].includes(selectedItemCategory) || selectedItemType === 'runeword') && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="ethereal" className="text-sm">Ethereal</Label>
                <input 
                  type="checkbox" 
                  id="ethereal"
                  checked={isEthereal}
                  onChange={(e) => setIsEthereal(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            )}
          </div>
          
          {/* Property List */}
          <div className="space-y-2">
            {itemProperties.map((prop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={prop.name}
                  onChange={(e) => updatePropertyName(index, e.target.value)}
                  placeholder="Property name"
                  className="flex-1"
                />
                <Input
                  value={prop.value}
                  onChange={(e) => updatePropertyValue(index, e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeProperty(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new property */}
          <div className="space-y-2">
            <Label>Add Property</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {getCommonPropertySuggestions().map((suggestion, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectSuggestion(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Property name"
                className="flex-1"
              />
              <Input
                value={newPropertyValue}
                onChange={(e) => setNewPropertyValue(e.target.value)}
                placeholder="Value"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={addProperty}
                className="shrink-0"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Other properties textarea for anything not covered by the structured inputs */}
          <div className="space-y-2">
            <Label htmlFor="customProperties">Additional Details</Label>
            <Textarea
              id="customProperties"
              value={customProperties}
              onChange={(e) => setCustomProperties(e.target.value)}
              placeholder="Any other details you want to include..."
              className="min-h-[60px]"
            />
          </div>

          <Button 
            onClick={handlePropertiesSubmit}
            className="w-full"
          >
            Confirm Properties
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemSelection;
