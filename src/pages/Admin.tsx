
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ItemStats {
  total: number;
  d2Count: number;
  d4Count: number;
}

interface Item {
  name: string;
  game: string;
  category: string;
  rarity: string;
  required_level: number;
  image_url: string | null;
  stats: string[];
  description: string;
  base_type: string;
}

const AdminPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>("unique_weapons");
  const [limit, setLimit] = useState<number>(50);
  const [importResults, setImportResults] = useState<{
    imported: number;
    items: string[];
  } | null>(null);

  // Fetch current item count for stats
  const { data: itemStats } = useQuery({
    queryKey: ["itemStats"],
    queryFn: async () => {
      try {
        // Get total count
        const { count: totalCount, error: totalError } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        
        // Get Diablo 2 items count
        const { count: d2Count, error: d2Error } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('game', 'diablo2_resurrected');
        
        if (d2Error) throw d2Error;
        
        // Get Diablo 4 items count
        const { count: d4Count, error: d4Error } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('game', 'diablo4');
        
        if (d4Error) throw d4Error;
        
        return {
          total: totalCount || 0,
          d2Count: d2Count || 0,
          d4Count: d4Count || 0,
        } as ItemStats;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching statistics",
          description: error.message,
        });
        return {
          total: 0,
          d2Count: 0,
          d4Count: 0,
        } as ItemStats;
      }
    },
  });

  const generateSampleItems = (category: string, limit: number): { items: Item[], names: string[] } => {
    const items: Item[] = [];
    const names: string[] = [];
    
    if (category === "runes") {
      // Generate some sample rune data for D2R
      const runeNames = ["El", "Eld", "Tir", "Nef", "Eth", "Ith", "Tal", "Ral", "Ort", "Thul", 
                       "Amn", "Sol", "Shael", "Dol", "Hel", "Io", "Lum", "Ko", "Fal", "Lem", 
                       "Pul", "Um", "Mal", "Ist", "Gul", "Vex", "Ohm", "Lo", "Sur", "Ber", "Jah", 
                       "Cham", "Zod"];
      
      const runeDescriptions: Record<string, string> = {
        "El": "+50 to Attack Rating, +1 to Light Radius",
        "Eld": "+75% Damage to Undead, +50 to Attack Rating against Undead",
        "Tir": "+2 to Mana after each Kill",
        "Nef": "Knockback",
        "Eth": "-25% to Target Defense",
        "Ith": "+9 to Maximum Damage",
        "Tal": "+75 Poison Damage over 5 seconds",
        "Ral": "Adds 5-30 Fire Damage",
        "Ort": "Adds 1-50 Lightning Damage",
        "Thul": "Adds 3-14 Cold Damage - 3 Second Duration",
        "Amn": "7% Life stolen per hit",
        "Sol": "+9 to Minimum Damage",
        "Shael": "20% Increased Attack Speed",
        "Dol": "Hit Causes Monster to Flee 25%",
        "Hel": "Requirements -15%",
        "Io": "+10 to Vitality",
        "Lum": "+10 to Energy",
        "Ko": "+10 to Dexterity",
        "Fal": "+10 to Strength",
        "Lem": "75% Extra Gold from Monsters",
        "Pul": "+75% Damage to Demons, +100 to Attack Rating against Demons",
        "Um": "25% Chance of Open Wounds",
        "Mal": "Prevent Monster Heal",
        "Ist": "30% Better Chance of Getting Magic Items",
        "Gul": "20% Bonus to Attack Rating",
        "Vex": "7% Mana stolen per hit",
        "Ohm": "+50% Enhanced Damage",
        "Lo": "20% Deadly Strike",
        "Sur": "Hit Blinds Target +20% to Hit Rating",
        "Ber": "20% Chance of Crushing Blow",
        "Jah": "Ignore Target's Defense",
        "Cham": "Freeze Target +3",
        "Zod": "Indestructible"
      };
      
      // Generate sample items
      for (let i = 0; i < Math.min(runeNames.length, limit); i++) {
        const name = runeNames[i];
        const itemName = `${name} Rune`;
        items.push({
          name: itemName,
          game: "diablo2_resurrected",
          category: "rune",
          rarity: "unique",
          required_level: 1 + (i * 2), // Higher runes require higher levels
          image_url: null,
          stats: [runeDescriptions[name]],
          description: `${name} is rune #${i+1} in Diablo 2 Resurrected.`,
          base_type: "Rune"
        });
        names.push(itemName);
      }
    } else if (category === "unique_weapons") {
      // Sample unique weapons data
      const weapons = [
        { name: "Windforce", level: 73, stats: ["+250% Enhanced Damage", "20% Increased Attack Speed", "Knockback"] },
        { name: "Grandfather", level: 81, stats: ["+200% Enhanced Damage", "+50% Damage to Demons", "+20 to Strength"] },
        { name: "Doombringer", level: 69, stats: ["+180% Enhanced Damage", "8% Life Steal", "40% Chance of Crushing Blow"] },
        { name: "Azurewrath", level: 85, stats: ["+350% Damage to Undead", "+30% Increased Attack Speed", "Level 10 Sanctuary Aura"] },
        { name: "Lightsabre", level: 58, stats: ["Adds 10-30 Lightning Damage", "+20% Increased Attack Speed", "5% Chance to Cast Level 14 Chain Lightning on Striking"] }
      ];
      
      for (let i = 0; i < Math.min(weapons.length, limit); i++) {
        const weapon = weapons[i];
        items.push({
          name: weapon.name,
          game: "diablo2_resurrected",
          category: "weapon",
          rarity: "unique",
          required_level: weapon.level,
          image_url: null,
          stats: weapon.stats,
          description: `${weapon.name} is a powerful unique weapon in Diablo 2 Resurrected.`,
          base_type: "Unique Weapon"
        });
        names.push(weapon.name);
      }
    } else if (category === "unique_armor") {
      // Sample unique armor data
      const armors = [
        { name: "Shako", level: 62, stats: ["+2 To All Skills", "+30% Better Chance of Getting Magic Items", "Damage Reduced By 10%"] },
        { name: "Arkaine's Valor", level: 85, stats: ["+200% Enhanced Defense", "+2 To All Skills", "30% Faster Hit Recovery"] },
        { name: "Leviathan", level: 65, stats: ["+200% Enhanced Defense", "+40 to Strength", "Damage Reduced by 25%"] },
        { name: "Guardian Angel", level: 51, stats: ["+180% Enhanced Defense", "+30% Faster Hit Recovery", "+15% to All Maximum Resistances"] },
        { name: "Tyrael's Might", level: 84, stats: ["+100% Enhanced Defense", "Indestructible", "Cannot Be Frozen"] }
      ];
      
      for (let i = 0; i < Math.min(armors.length, limit); i++) {
        const armor = armors[i];
        items.push({
          name: armor.name,
          game: "diablo2_resurrected",
          category: "armor",
          rarity: "unique",
          required_level: armor.level,
          image_url: null,
          stats: armor.stats,
          description: `${armor.name} is a powerful unique armor in Diablo 2 Resurrected.`,
          base_type: "Unique Armor"
        });
        names.push(armor.name);
      }
    } else if (category === "set_items") {
      // Sample set items data
      const setItems = [
        { name: "Tal Rasha's Horadric Crest", level: 66, stats: ["+2 To Sorceress Skill Levels", "10% Faster Cast Rate", "+30 Defense"] },
        { name: "Immortal King's Stone Crusher", level: 76, stats: ["+200% Enhanced Damage", "40% Chance of Crushing Blow", "35% Chance of Open Wounds"] },
        { name: "Trang-Oul's Claws", level: 45, stats: ["+2 To Necromancer Skill Levels", "25% Faster Cast Rate", "+30 to Mana"] },
        { name: "Natalya's Soul", level: 73, stats: ["+2 To Assassin Skill Levels", "+150 to Attack Rating", "+30% Faster Hit Recovery"] },
        { name: "Aldur's Advance", level: 45, stats: ["+180 Enhanced Defense", "40% Faster Run/Walk", "+50 to Life"] }
      ];
      
      for (let i = 0; i < Math.min(setItems.length, limit); i++) {
        const item = setItems[i];
        items.push({
          name: item.name,
          game: "diablo2_resurrected",
          category: "armor",
          rarity: "set",
          required_level: item.level,
          image_url: null,
          stats: item.stats,
          description: `${item.name} is part of a powerful set in Diablo 2 Resurrected.`,
          base_type: "Set Item"
        });
        names.push(item.name);
      }
    }
    
    return { items, names };
  };

  const importItems = async () => {
    setIsLoading(true);
    try {
      // Generate sample items based on the selected category
      const { items, names } = generateSampleItems(category, limit);
      
      let importedCount = 0;
      
      // Import each item to the database
      for (const item of items) {
        // Check if item already exists
        const { data: existingItem, error: checkError } = await supabase
          .from('items')
          .select('id')
          .eq('name', item.name)
          .maybeSingle();
        
        if (checkError) {
          console.error(`Error checking if item ${item.name} exists:`, checkError);
          continue;
        }
        
        if (!existingItem) {
          // Insert new item
          const { error } = await supabase
            .from('items')
            .insert(item);
          
          if (error) {
            console.error(`Error importing item ${item.name}:`, error);
          } else {
            importedCount++;
          }
        }
      }
      
      // Set import results
      setImportResults({
        imported: importedCount,
        items: names
      });
      
      // Invalidate the item stats query to refresh the counts
      queryClient.invalidateQueries({ queryKey: ["itemStats"] });
      
      toast({
        title: "Import Successful",
        description: `Imported ${importedCount} items from ${category}`,
      });
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-diablo-500 mb-6 drop-shadow-[0_0_10px_rgba(255,61,61,0.3)] uppercase tracking-wider">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Item Database Stats</CardTitle>
              <CardDescription>Current item counts in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-bold">{itemStats?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diablo 2 Items:</span>
                  <span className="font-bold">{itemStats?.d2Count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diablo 4 Items:</span>
                  <span className="font-bold">{itemStats?.d4Count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Import Tool Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Import Items</CardTitle>
              <CardDescription>Import items from Diablo 2 wiki sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    Category to Import
                  </label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unique_weapons">Unique Weapons</SelectItem>
                      <SelectItem value="unique_armor">Unique Armor</SelectItem>
                      <SelectItem value="set_items">Set Items</SelectItem>
                      <SelectItem value="runes">Runes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="limit" className="block text-sm font-medium">
                    Item Limit
                  </label>
                  <Input
                    id="limit"
                    type="number"
                    min="1"
                    max="500"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of items to import at once. Higher values may take longer.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={importItems} 
                disabled={isLoading}
                className="w-full bg-diablo-600 hover:bg-diablo-700"
              >
                {isLoading ? "Importing..." : "Import Items"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Import Results Card */}
          {importResults && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  Successfully imported {importResults.imported} items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {importResults.items && importResults.items.map((item: string, index: number) => (
                    <div key={index} className="text-sm py-1 border-b border-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
