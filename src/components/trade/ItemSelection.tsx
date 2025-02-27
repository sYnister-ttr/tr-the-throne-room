
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
import { Checkbox } from "@/components/ui/checkbox";

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
    console.log("Game type changed to:", gameType);
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

        // Fetch runewords - with a looser search pattern for better match rate
        const { data: runewords = [], error: runewordsError } = await supabase
          .from("runewords")
          .select("id, name, base_types")
          .eq("game", gameType)
          .or(`name.ilike.%${searchTerm}%,name.ilike.${searchTerm}%,name.ilike.%${searchTerm}`)
          .limit(20);
          
        if (runewordsError) {
          console.error("Error fetching runewords:", runewordsError);
          throw runewordsError;
        }

        console.log("Runewords found:", runewords.length);

        // If we still don't have runewords, let's try with common runeword searches
        if (runewords.length === 0 && ['enigma', 'infinity', 'spirit', 'grief', 'faith', 'insight', 'call to arms', 'cta'].some(
          rw => searchTerm.toLowerCase().includes(rw.toLowerCase())
        )) {
          console.log("Trying common runeword search");
          const commonRuneword = ['enigma', 'infinity', 'spirit', 'grief', 'faith', 'insight', 'call to arms', 'cta'].find(
            rw => searchTerm.toLowerCase().includes(rw.toLowerCase())
          );
          
          if (commonRuneword) {
            // Special case for 'call to arms' / 'cta'
            const searchValue = commonRuneword === 'cta' ? 'call to arms' : commonRuneword;
            
            const { data: specificRunewords = [] } = await supabase
              .from("runewords")
              .select("id, name, base_types")
              .eq("game", gameType)
              .ilike("name", `%${searchValue}%`)
              .limit(5);
              
            console.log(`Found ${specificRunewords.length} results for common runeword: ${commonRuneword}`);
            
            if (specificRunewords.length > 0) {
              runewords.push(...specificRunewords);
            }
          }
        }

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

        // Add fallback runewords if we still don't have any
        if (formattedRunewords.length === 0) {
          const fallbackRunewords = [
            { name: 'Enigma', id: 'fallback-enigma', base_types: ['Body Armor'] },
            { name: 'Infinity', id: 'fallback-infinity', base_types: ['Polearm', 'Spear'] },
            { name: 'Spirit', id: 'fallback-spirit', base_types: ['Sword', 'Shield'] },
            { name: 'Call to Arms', id: 'fallback-cta', base_types: ['Sword', 'Scepter', 'Hammer'] },
            { name: 'Grief', id: 'fallback-grief', base_types: ['Sword', 'Axe'] },
            { name: 'Insight', id: 'fallback-insight', base_types: ['Polearm', 'Staff'] },
            { name: 'Heart of the Oak', id: 'fallback-hoto', base_types: ['Staff', 'Mace'] }
          ];
          
          const matchingFallbacks = fallbackRunewords.filter(rw => 
            rw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            searchTerm.toLowerCase().includes(rw.name.toLowerCase())
          );
          
          if (matchingFallbacks.length > 0) {
            console.log("Using fallback runewords:", matchingFallbacks.length);
            
            formattedRunewords.push(...matchingFallbacks.map(rw => ({
              id: rw.id,
              name: rw.name,
              itemType: 'runeword',
              category: 'runeword',
              base_types: rw.base_types
            })));
          }
        }

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
  const getItemSpecificSuggestions = () => {
    const itemName = searchTerm.toLowerCase();
    
    // Specific runewords
    if (selectedItemType === 'runeword') {
      if (itemName.includes('infinity')) {
        return [
          "Base Item",
          "-% to Enemy Lightning Resistance",
          "Lightning Absorb",
          "Vitality",
          "Critical Strike"
        ];
      }
      
      if (itemName.includes('enigma')) {
        return [
          "Base Item",
          "+to Strength",
          "+% Enhanced Defense",
          "Magic Find",
          "Damage Reduced"
        ];
      }

      if (itemName.includes('call to arms') || itemName.includes('cta')) {
        return [
          "Base Item",
          "Battle Command",
          "Battle Orders",
          "Battle Cry"
        ];
      }
      
      if (itemName.includes('spirit')) {
        return [
          "Base Item",
          "+to All Skills",
          "Faster Cast Rate",
          "Vitality",
          "Mana"
        ];
      }
      
      if (itemName.includes('grief')) {
        return [
          "Base Item",
          "+Damage",
          "Increased Attack Speed",
          "+to Life After Kill"
        ];
      }
      
      // Default runeword properties
      return [
        "Base Item",
        "Sockets",
        "+% Enhanced Defense"
      ];
    }
    
    // Unique items
    if (selectedItemType === 'unique') {
      if (itemName === 'shako' || itemName === 'harlequin crest') {
        return [
          "Defense",
          "+to All Skills",
          "Magic Find",
          "+to Life",
          "+to Mana"
        ];
      }
      
      if (itemName === 'herald of zakarum' || itemName === 'hoz') {
        return [
          "Enhanced Defense",
          "Blocking",
          "+to Paladin Skills",
          "Resistances"
        ];
      }

      if (itemName.includes('oculus') || itemName.includes('occy')) {
        return [
          "+to All Skills",
          "Faster Cast Rate",
          "Resistances",
          "Magic Find"
        ];
      }
      
      if (itemName.includes('stormshield')) {
        return [
          "Enhanced Defense",
          "Damage Reduction",
          "Block",
          "Cold Resistance"
        ];
      }
      
      if (itemName.includes('titan')) {
        return [
          "Enhanced Damage",
          "Amazon Skills",
          "Replenishes Quantity",
          "Strength",
          "Increased Attack Speed"
        ];
      }

      if (itemName.includes('circlet') || itemName.includes('coronet') || itemName.includes('tiara') || itemName.includes('diadem')) {
        return [
          "+to Skills",
          "Faster Cast Rate",
          "Resistances",
          "Strength",
          "Dexterity"
        ];
      }
    }
    
    // Type/category based suggestions
    if (selectedItemType === 'normal') {
      if (selectedItemCategory === 'weapon') {
        return [
          "Sockets",
          "Enhanced Damage",
          "Attack Rating"
        ];
      }
      
      if (selectedItemCategory === 'armor') {
        return [
          "Sockets",
          "Enhanced Defense",
          "Defense"
        ];
      }
      
      if (selectedItemCategory === 'jewelry') {
        return [
          "Resistances",
          "Faster Cast Rate",
          "Magic Find"
        ];
      }
    }
    
    if (selectedItemType === 'magic' || selectedItemType === 'rare') {
      if (selectedItemCategory === 'weapon') {
        return [
          "Enhanced Damage",
          "Attack Speed",
          "Strength",
          "Life Leech"
        ];
      }
      
      if (selectedItemCategory === 'armor') {
        return [
          "Enhanced Defense",
          "Life",
          "Resistances",
          "Faster Hit Recovery"
        ];
      }
      
      if (selectedItemCategory === 'jewelry') {
        return [
          "Faster Cast Rate",
          "Resistances",
          "Life",
          "Strength",
          "Dexterity"
        ];
      }
    }
    
    // Default generic properties
    return [
      "Defense",
      "Damage",
      "Requirements"
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
    
    // Reset properties without auto-populating
    setItemProperties([]);
    setIsEthereal(false);
    setCustomProperties("");
    
    setSearchTerm(item.name);
    setOpen(false);
  };

  const addProperty = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (newPropertyName.trim()) {
      console.log("Adding property:", newPropertyName, newPropertyValue);
      setItemProperties([...itemProperties, { 
        name: newPropertyName, 
        value: newPropertyValue 
      }]);
      
      setNewPropertyName("");
      setNewPropertyValue("");
    }
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
    
    console.log("Submitting properties:", propertyText);
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

  // If no search results are available but we have a search term, let's provide a way to create a custom item
  const handleCreateCustomItem = () => {
    // Set some default values based on the search term
    setSelectedItemType('normal');
    setSelectedItemCategory('weapon');
    setSearchTerm(searchTerm); // Keep the search term
    setOpen(false);
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
                {isLoading ? (
                  "Loading..."
                ) : searchTerm.length < 2 ? (
                  "Type at least 2 characters to search"
                ) : (
                  <div className="p-2 text-center">
                    <p className="mb-2">No items found.</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={handleCreateCustomItem}
                    >
                      Use "{searchTerm}" as custom item
                    </Button>
                  </div>
                )}
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
                <Checkbox
                  id="ethereal"
                  checked={isEthereal}
                  onCheckedChange={(checked) => setIsEthereal(checked === true)}
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
                  className="flex-1"
                />
                <Input
                  value={prop.value}
                  onChange={(e) => updatePropertyValue(index, e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeProperty(index)}
                  type="button"
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
              {/* Item specific suggestions first */}
              {getItemSpecificSuggestions().map((suggestion, i) => (
                <Button 
                  key={`specific-${i}`} 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectSuggestion(suggestion)}
                  type="button"
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
              
              {/* Common suggestions */}
              {getCommonPropertySuggestions().map((suggestion, i) => (
                <Button 
                  key={`common-${i}`} 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectSuggestion(suggestion)}
                  type="button"
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
                className="flex-1"
                placeholder="Property name"
              />
              <Input
                value={newPropertyValue}
                onChange={(e) => setNewPropertyValue(e.target.value)}
                className="flex-1"
                placeholder="Value"
              />
              <Button 
                variant="outline"
                onClick={addProperty}
                type="button"
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
              className="min-h-[60px]"
            />
          </div>

          <Button 
            onClick={handlePropertiesSubmit}
            type="button"
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
