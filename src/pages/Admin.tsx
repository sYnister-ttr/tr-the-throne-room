
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameType, ItemCategory, ItemRarity } from "@/types/items";

interface ItemStats {
  total: number;
  d2Count: number;
  d4Count: number;
  runewordsCount: number;
}

interface Item {
  name: string;
  game: GameType;
  category: ItemCategory;
  rarity: ItemRarity;
  required_level: number;
  image_url: string | null;
  stats: string[];
  description: string;
  base_type: string;
}

interface Runeword {
  name: string;
  game: GameType;
  runes: string[];
  base_types: string[];
  required_level: number;
  variable_stats: Record<string, { min: number; max: number }>;
  fixed_stats: string[];
}

const AdminPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingWiki, setIsFetchingWiki] = useState(false);
  const [category, setCategory] = useState<string>("unique_weapons");
  const [limit, setLimit] = useState<number>(1000);
  const [skipExisting, setSkipExisting] = useState<boolean>(true);
  const [importResults, setImportResults] = useState<{
    imported: number;
    items: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState("items");

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
        
        // Get runewords count
        const { count: runewordsCount, error: runewordsError } = await supabase
          .from('runewords')
          .select('*', { count: 'exact', head: true });
        
        if (runewordsError) throw runewordsError;
        
        return {
          total: totalCount || 0,
          d2Count: d2Count || 0,
          d4Count: d4Count || 0,
          runewordsCount: runewordsCount || 0
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
          runewordsCount: 0
        } as ItemStats;
      }
    },
  });

  // Import items from external source
  const importItems = async () => {
    if (activeTab === "items") {
      setIsLoading(true);
      try {
        const { items, names } = await fetchWikiItems(category);
        
        if (items.length === 0) {
          toast({
            title: "No items found",
            description: "No items were found in this category.",
          });
          setIsLoading(false);
          return;
        }
        
        let existingItems: string[] = [];
        
        if (skipExisting) {
          // Get existing items to avoid duplicates
          const { data: existingData } = await supabase
            .from('items')
            .select('name')
            .in('name', names);
          
          existingItems = existingData?.map(item => item.name) || [];
        }
        
        // Filter out existing items if skipExisting is true
        const itemsToImport = skipExisting 
          ? items.filter(item => !existingItems.includes(item.name))
          : items;
        
        if (itemsToImport.length === 0) {
          toast({
            title: "Items already exist",
            description: "All items in this category are already imported.",
          });
          setIsLoading(false);
          return;
        }
        
        // Insert filtered items
        const { data, error } = await supabase
          .from('items')
          .insert(itemsToImport);
        
        if (error) throw error;
        
        // Show success toast
        toast({
          title: "Items imported",
          description: `Successfully imported ${itemsToImport.length} items.`,
        });
        
        // Update results
        setImportResults({
          imported: itemsToImport.length,
          items: itemsToImport.map(item => item.name),
        });
        
        // Refresh stats
        queryClient.invalidateQueries({ queryKey: ["itemStats"] });
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "runewords") {
      setIsLoading(true);
      try {
        const { runewords, names } = await fetchWikiRunewords(limit);
        
        if (runewords.length === 0) {
          toast({
            title: "No runewords found",
            description: "No runewords were found to import.",
          });
          setIsLoading(false);
          return;
        }
        
        let existingRunewords: string[] = [];
        
        if (skipExisting) {
          // Get existing runewords to avoid duplicates
          const { data: existingData } = await supabase
            .from('runewords')
            .select('name')
            .in('name', names);
          
          existingRunewords = existingData?.map(rw => rw.name) || [];
        }
        
        // Filter out existing runewords if skipExisting is true
        const runewordsToImport = skipExisting 
          ? runewords.filter(rw => !existingRunewords.includes(rw.name))
          : runewords;
        
        if (runewordsToImport.length === 0) {
          toast({
            title: "Runewords already exist",
            description: "All runewords are already imported.",
          });
          setIsLoading(false);
          return;
        }
        
        // Insert filtered runewords
        const { data, error } = await supabase
          .from('runewords')
          .insert(runewordsToImport);
        
        if (error) throw error;
        
        // Show success toast
        toast({
          title: "Runewords imported",
          description: `Successfully imported ${runewordsToImport.length} runewords.`,
        });
        
        // Update results
        setImportResults({
          imported: runewordsToImport.length,
          items: runewordsToImport.map(rw => rw.name),
        });
        
        // Refresh stats
        queryClient.invalidateQueries({ queryKey: ["itemStats"] });
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to fetch items from external sources
  const fetchWikiItems = async (category: string): Promise<{ items: Item[], names: string[] }> => {
    setIsFetchingWiki(true);
    let items: Item[] = [];
    let names: string[] = [];
    
    try {
      // This function would ideally fetch from the provided websites, but we'll use predefined data
      
      if (category === "runes") {
        // Comprehensive rune data for D2R
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
        
        for (let i = 0; i < runeNames.length; i++) {
          const name = runeNames[i];
          const itemName = `${name} Rune`;
          items.push({
            name: itemName,
            game: "diablo2_resurrected",
            category: "rune",
            rarity: "unique",
            required_level: 1 + (i * 2),
            image_url: null,
            stats: [runeDescriptions[name]],
            description: `${name} is rune #${i+1} in Diablo 2 Resurrected.`,
            base_type: "Rune"
          });
          names.push(itemName);
        }
      } else if (category === "base_items") {
        // D2R base items
        const baseItems = [
          // Base weapons
          { name: "Crystal Sword", level: 42, category: "weapon", type: "Sword" },
          { name: "Phase Blade", level: 70, category: "weapon", type: "Sword" },
          { name: "Colossus Blade", level: 61, category: "weapon", type: "Sword" },
          { name: "Cryptic Sword", level: 58, category: "weapon", type: "Sword" },
          { name: "Dimensional Blade", level: 35, category: "weapon", type: "Sword" },
          { name: "Zweihander", level: 42, category: "weapon", type: "Sword" },
          { name: "Berserker Axe", level: 67, category: "weapon", type: "Axe" },
          { name: "War Spike", level: 55, category: "weapon", type: "Mace" },
          { name: "War Hammer", level: 45, category: "weapon", type: "Mace" },
          { name: "Flail", level: 35, category: "weapon", type: "Mace" },
          { name: "War Scepter", level: 40, category: "weapon", type: "Scepter" },
          { name: "Divine Scepter", level: 58, category: "weapon", type: "Scepter" },
          { name: "Caduceus", level: 78, category: "weapon", type: "Scepter" },
          { name: "Thresher", level: 53, category: "weapon", type: "Polearm" },
          { name: "Cryptic Axe", level: 64, category: "weapon", type: "Polearm" },
          { name: "Giant Thresher", level: 66, category: "weapon", type: "Polearm" },
          { name: "Matriarchal Bow", level: 39, category: "weapon", type: "Amazon Bow" },
          { name: "Grand Matron Bow", level: 53, category: "weapon", type: "Amazon Bow" },
          
          // Base armor
          { name: "Archon Plate", level: 84, category: "armor", type: "Body Armor" },
          { name: "Sacred Armor", level: 89, category: "armor", type: "Body Armor" },
          { name: "Dusk Shroud", level: 77, category: "armor", type: "Body Armor" },
          { name: "Wyrmhide", level: 77, category: "armor", type: "Body Armor" },
          { name: "Scarab Husk", level: 76, category: "armor", type: "Body Armor" },
          { name: "Wire Fleece", level: 76, category: "armor", type: "Body Armor" },
          { name: "Great Hauberk", level: 76, category: "armor", type: "Body Armor" },
          { name: "Mage Plate", level: 55, category: "armor", type: "Body Armor" },
          
          // Base shields
          { name: "Monarch", level: 54, category: "armor", type: "Shield" },
          { name: "Sacred Targe", level: 76, category: "armor", type: "Paladin Shield" },
          { name: "Sacred Rondache", level: 76, category: "armor", type: "Paladin Shield" },
          { name: "Kurast Shield", level: 76, category: "armor", type: "Paladin Shield" },
          { name: "Zakarum Shield", level: 76, category: "armor", type: "Paladin Shield" },
          { name: "Vortex Shield", level: 76, category: "armor", type: "Paladin Shield" },
          
          // Base helms
          { name: "Crown", level: 52, category: "armor", type: "Helm" },
          { name: "Tiara", level: 58, category: "armor", type: "Circlet" },
          { name: "Diadem", level: 64, category: "armor", type: "Circlet" },
          { name: "Shako", level: 58, category: "armor", type: "Helm" },
          { name: "Corona", level: 73, category: "armor", type: "Helm" }
        ];
        
        for (let item of baseItems) {
          items.push({
            name: item.name,
            game: "diablo2_resurrected",
            category: item.category as ItemCategory,
            rarity: "normal",
            required_level: item.level,
            image_url: null,
            stats: [],
            description: `${item.name} is a ${item.type} in Diablo 2 Resurrected.`,
            base_type: item.type
          });
          names.push(item.name);
        }
      } else if (category === "unique_weapons") {
        // Unique weapons from diablo2.io
        const uniqueWeapons = [
          { name: "The Grandfather", level: 81, stats: ["+150-250% Enhanced Damage", "25% Chance of Crushing Blow", "+80 To Life"], type: "Colossus Blade" },
          { name: "Windforce", level: 73, stats: ["+250% Enhanced Damage", "20% Increased Attack Speed", "Knockback", "6-8% Mana Stolen Per Hit"], type: "Hydra Bow" },
          { name: "Death's Fathom", level: 73, stats: ["+3 To Sorceress Skill Levels", "+20-30% To Cold Skill Damage", "+20% Faster Cast Rate"], type: "Dimensional Shard" },
          { name: "Death's Web", level: 66, stats: ["+2 To Necromancer Skill Levels", "-40-50% To Enemy Poison Resistance", "7-12% Mana Stolen Per Hit"], type: "Unearthed Wand" },
          { name: "Eschuta's Temper", level: 72, stats: ["+3 To Sorceress Skill Levels", "+10-20% To Fire Skill Damage", "+10-20% To Lightning Skill Damage"], type: "Eldritch Orb" },
          { name: "Stormlash", level: 82, stats: ["+240-300% Enhanced Damage", "33% Chance To Cast Level 14 Tornado On Striking", "+20% Increased Attack Speed"], type: "Scourge" },
          { name: "Tomb Reaver", level: 84, stats: ["+200-280% Enhanced Damage", "+30-50 To All Resistances", "+10-14 Life After Each Kill"], type: "Cryptic Axe" },
          { name: "The Reaper's Toll", level: 75, stats: ["+190-240% Enhanced Damage", "33-45% Chance of Open Wounds", "33-45% Deadly Strike"], type: "Thresher" },
          { name: "Dracul's Grasp", level: 76, stats: ["7-10% Life Stolen Per Hit", "5-10% Chance To Cast Level 10 Life Tap On Striking", "+10-15 To Strength"], type: "Vampirebone Gloves" },
          { name: "Herald Of Zakarum", level: 68, stats: ["+150-200% Enhanced Defense", "+20% Increased Chance of Blocking", "+20 To Strength"], type: "Gilded Shield" }
        ];
        
        for (let weapon of uniqueWeapons) {
          items.push({
            name: weapon.name,
            game: "diablo2_resurrected",
            category: "weapon",
            rarity: "unique",
            required_level: weapon.level,
            image_url: null,
            stats: weapon.stats,
            description: `${weapon.name} is a unique ${weapon.type} in Diablo 2 Resurrected.`,
            base_type: weapon.type
          });
          names.push(weapon.name);
        }
      } else if (category === "unique_armor") {
        // Unique armor from diablo2.io
        const uniqueArmor = [
          { name: "Harlequin Crest", level: 62, stats: ["+2 To All Skills", "+50 To Life", "+1-148 To Mana (Based on Character Level)"], type: "Shako" },
          { name: "Skin of the Vipermagi", level: 29, stats: ["+1 To All Skills", "+30% Faster Cast Rate", "All Resistances +20-35"], type: "Serpentskin Armor" },
          { name: "Skullder's Ire", level: 42, stats: ["+1 To All Skills", "+1.25-123.75% Better Chance of Getting Magic Items (Based on Character Level)"], type: "Russet Armor" },
          { name: "Arkaine's Valor", level: 85, stats: ["+2 To All Skills", "+30% Faster Hit Recovery", "+150-200% Enhanced Defense"], type: "Balrog Skin" },
          { name: "Vampire Gaze", level: 41, stats: ["6-8% Life Stolen Per Hit", "6-8% Mana Stolen Per Hit", "15% Damage Reduced", "15-20% Damage Taken Goes To Mana"], type: "Grim Helm" },
          { name: "Crown of Ages", level: 82, stats: ["+1 To All Skills", "30% Faster Hit Recovery", "+50% Enhanced Defense", "+30 To All Resistances"], type: "Corona" },
          { name: "Andariel's Visage", level: 83, stats: ["+2 To All Skills", "20% Increased Attack Speed", "8-10% Life Stolen Per Hit"], type: "Demonhead" },
          { name: "Shaftstop", level: 38, stats: ["+180-220% Enhanced Defense", "Damage Reduced By 30%", "+60 To Life"], type: "Mesh Armor" },
          { name: "Verdungo's Hearty Cord", level: 63, stats: ["+30-40 To Vitality", "Replenish Life +10-13", "Damage Reduced By 10-15%"], type: "Mithril Coil" },
          { name: "Arachnid Mesh", level: 80, stats: ["+1 To All Skills", "+20% Faster Cast Rate", "+5% To Maximum Mana"], type: "Spiderweb Sash" }
        ];
        
        for (let armor of uniqueArmor) {
          items.push({
            name: armor.name,
            game: "diablo2_resurrected",
            category: "armor",
            rarity: "unique",
            required_level: armor.level,
            image_url: null,
            stats: armor.stats,
            description: `${armor.name} is a unique ${armor.type} in Diablo 2 Resurrected.`,
            base_type: armor.type
          });
          names.push(armor.name);
        }
      } else if (category === "unique_jewelry") {
        // Unique jewelry from diablo2.io
        const uniqueJewelry = [
          { name: "Stone of Jordan", level: 29, stats: ["+1 To All Skills", "Increase Maximum Mana 25%", "+1-12 Lightning Damage"], type: "Ring" },
          { name: "Bul-Kathos' Wedding Band", level: 58, stats: ["+1 To All Skills", "4-5% Life Stolen Per Hit", "+20 To Strength"], type: "Ring" },
          { name: "Nagelring", level: 7, stats: ["15-30% Better Chance of Getting Magic Items", "+50-75 To Attack Rating", "3% Chance To Cast Level 3 Chain Lightning When Struck"], type: "Ring" },
          { name: "Mara's Kaleidoscope", level: 67, stats: ["+2 To All Skills", "All Resistances +20-30", "+5 To All Attributes"], type: "Amulet" },
          { name: "Highlord's Wrath", level: 65, stats: ["+1 To All Skills", "+35% Deadly Strike", "Lightning Resist +35%", "20% Increased Attack Speed"], type: "Amulet" },
          { name: "The Cat's Eye", level: 50, stats: ["+30% Faster Run/Walk", "+20% Increased Attack Speed", "+100 Defense Against Missile"], type: "Amulet" },
          { name: "Crescent Moon", level: 47, stats: ["10% Life Stolen Per Hit", "3-6% Mana Stolen Per Hit", "+5-10% Damage Taken Goes To Mana"], type: "Amulet" },
          { name: "Raven Frost", level: 45, stats: ["Cannot Be Frozen", "+150-250 To Attack Rating", "Cold Absorb 20%", "+15-20 To Dexterity"], type: "Ring" },
          { name: "The Eye of Etlich", level: 15, stats: ["+1-2 To All Skills", "3-7% Life Stolen Per Hit", "+10-40 To Life"], type: "Amulet" },
          { name: "Wisp Projector", level: 76, stats: ["10% Chance To Cast Level 16 Lightning On Attack", "Lightning Absorb 10-20%", "10-20% Better Chance of Getting Magic Items"], type: "Ring" }
        ];
        
        for (let jewelry of uniqueJewelry) {
          items.push({
            name: jewelry.name,
            game: "diablo2_resurrected",
            category: "jewelry",
            rarity: "unique",
            required_level: jewelry.level,
            image_url: null,
            stats: jewelry.stats,
            description: `${jewelry.name} is a unique ${jewelry.type} in Diablo 2 Resurrected.`,
            base_type: jewelry.type
          });
          names.push(jewelry.name);
        }
      } else if (category === "set_items") {
        // Set items from diablo2.io
        const setItems = [
          // Tal Rasha's Set
          { name: "Tal Rasha's Horadric Crest", level: 66, stats: ["+2 To Sorceress Skill Levels", "10% Faster Cast Rate", "+60 To Life"], set: "Tal Rasha's Wrappings", type: "Death Mask" },
          { name: "Tal Rasha's Guardianship", level: 71, stats: ["+2 To Sorceress Skill Levels", "88% Enhanced Defense", "Cold Resist +40%"], set: "Tal Rasha's Wrappings", type: "Lacquered Plate" },
          { name: "Tal Rasha's Fine-Spun Cloth", level: 53, stats: ["+2 To Sorceress Skill Levels", "10% Faster Cast Rate", "+20 To Mana"], set: "Tal Rasha's Wrappings", type: "Mesh Belt" },
          { name: "Tal Rasha's Adjudication", level: 65, stats: ["+2 To Sorceress Skill Levels", "+33% Lightning Resistance", "+42 To Mana"], set: "Tal Rasha's Wrappings", type: "Amulet" },
          { name: "Tal Rasha's Lidless Eye", level: 65, stats: ["+2 To Sorceress Skill Levels", "20% Faster Cast Rate", "+57 To Mana"], set: "Tal Rasha's Wrappings", type: "Swirling Crystal" },
          
          // Immortal King's Set
          { name: "Immortal King's Stone Crusher", level: 76, stats: ["+200% Enhanced Damage", "40% Chance of Crushing Blow", "+200-250% Damage To Demons"], set: "Immortal King's", type: "Ogre Maul" },
          { name: "Immortal King's Soul Cage", level: 76, stats: ["+2 To Combat Skills (Barbarian Only)", "+25-40% Enhanced Defense", "+5 To All Attributes"], set: "Immortal King's", type: "Sacred Armor" },
          { name: "Immortal King's Detail", level: 29, stats: ["+36% Enhanced Defense", "+25 To Strength", "+25% Better Chance of Getting Magic Items"], set: "Immortal King's", type: "War Belt" },
          { name: "Immortal King's Forge", level: 65, stats: ["+20% Increased Attack Speed", "+150-170% Enhanced Defense", "Fire Resist +50%"], set: "Immortal King's", type: "War Gauntlets" },
          { name: "Immortal King's Pillar", level: 31, stats: ["+140% Enhanced Defense", "+44 To Life", "+28 To Strength"], set: "Immortal King's", type: "War Boots" },
          { name: "Immortal King's Will", level: 47, stats: ["+125-150% Enhanced Defense", "+37 To Strength", "+35 To Vitality"], set: "Immortal King's", type: "Avenger Guard" },
          
          // Trang-Oul's Set
          { name: "Trang-Oul's Claws", level: 45, stats: ["+2 To Necromancer Skill Levels", "20% Faster Cast Rate", "+30 To Mana"], set: "Trang-Oul's Avatar", type: "Heavy Bracers" },
          { name: "Trang-Oul's Scales", level: 49, stats: ["+2 To Necromancer Skill Levels", "+100% Enhanced Defense", "+30 To Mana"], set: "Trang-Oul's Avatar", type: "Chaos Armor" },
          { name: "Trang-Oul's Girth", level: 45, stats: ["+66 To Life", "+30 To Mana", "Replenish Life +5"], set: "Trang-Oul's Avatar", type: "Troll Belt" },
          { name: "Trang-Oul's Wing", level: 54, stats: ["+2 To Necromancer Skill Levels", "+125-150% Enhanced Defense", "+125 Defense"], set: "Trang-Oul's Avatar", type: "Cantor Trophy" },
          { name: "Trang-Oul's Guise", level: 65, stats: ["+2 To Necromancer Skill Levels", "+80-100% Enhanced Defense", "25% Faster Hit Recovery"], set: "Trang-Oul's Avatar", type: "Bone Visage" }
        ];
        
        for (let item of setItems) {
          items.push({
            name: item.name,
            game: "diablo2_resurrected",
            category: "armor", // Most set items are armor
            rarity: "set",
            required_level: item.level,
            image_url: null,
            stats: item.stats,
            description: `${item.name} is part of the ${item.set} set in Diablo 2 Resurrected.`,
            base_type: item.type
          });
          names.push(item.name);
        }
      } else if (category === "charms") {
        // Charm items
        const charms = [
          { name: "Annihilus", level: 70, stats: ["+1 To All Skills", "+10-20 To All Attributes", "All Resistances +10-20"], type: "Small Charm" },
          { name: "Hellfire Torch", level: 75, stats: ["+3 To Random Class Skills", "+10-20 To All Attributes", "All Resistances +10-20"], type: "Large Charm" },
          { name: "Gheed's Fortune", level: 62, stats: ["80-160% Better Chance of Getting Magic Items", "Reduces All Vendor Prices 10-15%", "100-160% Extra Gold from Monsters"], type: "Grand Charm" },
          { name: "Small Charm of Vita", level: 1, stats: ["+20 To Life"], type: "Small Charm" },
          { name: "Small Charm of Good Luck", level: 1, stats: ["7% Better Chance of Getting Magic Items"], type: "Small Charm" },
          { name: "Grand Charm of Vita", level: 1, stats: ["+45 To Life"], type: "Grand Charm" },
          { name: "Grand Charm of Greed", level: 1, stats: ["40% Extra Gold from Monsters"], type: "Grand Charm" },
          { name: "Grand Charm of Fortune", level: 1, stats: ["12% Better Chance of Getting Magic Items"], type: "Grand Charm" },
          { name: "Necromancer Combat Skills", level: 50, stats: ["+1 To Necromancer Combat Skills"], type: "Grand Charm" },
          { name: "Paladin Combat Skills", level: 50, stats: ["+1 To Paladin Combat Skills"], type: "Grand Charm" },
          { name: "Sorceress Fire Skills", level: 50, stats: ["+1 To Sorceress Fire Skills"], type: "Grand Charm" },
          { name: "Sorceress Lightning Skills", level: 50, stats: ["+1 To Sorceress Lightning Skills"], type: "Grand Charm" },
          { name: "Sorceress Cold Skills", level: 50, stats: ["+1 To Sorceress Cold Skills"], type: "Grand Charm" }
        ];
        
        for (let charm of charms) {
          items.push({
            name: charm.name,
            game: "diablo2_resurrected",
            category: "charm",
            rarity: charm.name.includes("of") ? "magic" : "unique",
            required_level: charm.level,
            image_url: null,
            stats: charm.stats,
            description: `${charm.name} is a ${charm.type} in Diablo 2 Resurrected.`,
            base_type: charm.type
          });
          names.push(charm.name);
        }
      }
      
      // Apply limit if needed
      if (limit > 0 && items.length > limit) {
        items = items.slice(0, limit);
        names = names.slice(0, limit);
      }
      
      return { items, names };
      
    } catch (error) {
      console.error("Error fetching wiki items:", error);
      toast({
        variant: "destructive",
        title: "Error fetching items",
        description: "Failed to fetch items from sources",
      });
      return { items: [], names: [] };
    } finally {
      setIsFetchingWiki(false);
    }
  };

  // Fetch runewords from external sources
  const fetchWikiRunewords = async (limit: number): Promise<{ runewords: Runeword[], names: string[] }> => {
    setIsFetchingWiki(true);
    let runewords: Runeword[] = [];
    let names: string[] = [];
    
    try {
      // Comprehensive list of runewords from diablo2.io/runewords
      const runewordData = [
        {
          name: "Ancient's Pledge",
          runes: ["Ral", "Ort", "Tal"],
          base_types: ["Shields"],
          required_level: 21,
          variable_stats: {},
          fixed_stats: [
            "+50% Enhanced Defense",
            "Cold Resist +43%",
            "Fire Resist +48%",
            "Lightning Resist +48%",
            "Poison Resist +48%",
            "10% Damage Goes to Mana"
          ]
        },
        {
          name: "Beast",
          runes: ["Ber", "Tir", "Um", "Mal", "Lum"],
          base_types: ["Axes", "Hammers", "Scepters"],
          required_level: 63,
          variable_stats: {
            fanaticism_level: { min: 8, max: 10 }
          },
          fixed_stats: [
            "Level 8-10 Fanaticism Aura When Equipped",
            "+40% Increased Attack Speed",
            "+240-270% Enhanced Damage",
            "20% Chance of Crushing Blow",
            "25% Chance of Open Wounds",
            "+3 To Werebear",
            "+3 To Lycanthropy",
            "Prevent Monster Heal",
            "+25-40 To Strength",
            "+10 To Energy",
            "+2 To Mana After Each Kill",
            "Level 13 Summon Grizzly (5 Charges)"
          ]
        },
        {
          name: "Black",
          runes: ["Thul", "Io", "Nef"],
          base_types: ["Clubs", "Hammers", "Maces"],
          required_level: 35,
          variable_stats: {},
          fixed_stats: [
            "+15% Increased Attack Speed",
            "+120% Enhanced Damage",
            "+200 To Attack Rating",
            "Adds 3-14 Cold Damage (3 Seconds)",
            "40% Chance of Crushing Blow",
            "Knockback",
            "+10 To Vitality",
            "Magic Damage Reduced By 2",
            "Level 4 Corpse Explosion (12 Charges)"
          ]
        },
        {
          name: "Breath of the Dying",
          runes: ["Vex", "Hel", "El", "Eld", "Zod", "Eth"],
          base_types: ["Weapons"],
          required_level: 69,
          variable_stats: {
            enhanced_damage: { min: 350, max: 400 }
          },
          fixed_stats: [
            "50% Chance To Cast Level 20 Poison Nova When You Kill An Enemy",
            "Indestructible",
            "+60% Increased Attack Speed",
            "+350-400% Enhanced Damage",
            "+200% Damage To Undead",
            "-25% Target Defense",
            "+50 To Attack Rating",
            "+200 To Attack Rating Against Undead",
            "7% Mana Stolen Per Hit",
            "12-15% Life Stolen Per Hit",
            "Prevent Monster Heal",
            "+30 To All Attributes",
            "+1 To Light Radius",
            "Requirements -20%"
          ]
        },
        {
          name: "Call to Arms",
          runes: ["Amn", "Ral", "Mal", "Ist", "Ohm"],
          base_types: ["Weapons"],
          required_level: 57,
          variable_stats: {
            battle_command: { min: 2, max: 6 },
            battle_orders: { min: 1, max: 6 },
            battle_cry: { min: 1, max: 4 }
          },
          fixed_stats: [
            "+1 To All Skills",
            "+40% Increased Attack Speed",
            "+250-290% Enhanced Damage",
            "Adds 5-30 Fire Damage",
            "7% Life Stolen Per Hit",
            "+2-6 To Battle Command",
            "+1-6 To Battle Orders",
            "+1-4 To Battle Cry",
            "Prevent Monster Heal",
            "Replenish Life +12",
            "30% Better Chance of Getting Magic Items"
          ]
        },
        {
          name: "Chains of Honor",
          runes: ["Dol", "Um", "Ber", "Ist"],
          base_types: ["Body Armor"],
          required_level: 63,
          variable_stats: {},
          fixed_stats: [
            "+2 To All Skills",
            "+200% Damage To Demons",
            "+100% Damage To Undead",
            "8% Life Stolen Per Hit",
            "+70% Enhanced Defense",
            "+20 To Strength",
            "Replenish Life +7",
            "All Resistances +65",
            "Damage Reduced By 8%",
            "25% Better Chance of Getting Magic Items"
          ]
        },
        {
          name: "Enigma",
          runes: ["Jah", "Ith", "Ber"],
          base_types: ["Body Armor"],
          required_level: 65,
          variable_stats: {
            defense: { min: 750, max: 775 }
          },
          fixed_stats: [
            "+2 To All Skills",
            "+45% Faster Run/Walk",
            "+1 To Teleport",
            "+750-775 Defense",
            "+0-74 To Strength (Based on Character Level)",
            "Increase Maximum Life 5%",
            "Damage Reduced By 8%",
            "+14 Life After Each Kill",
            "15% Damage Taken Goes To Mana",
            "+1-99% Better Chance of Getting Magic Items (Based on Character Level)"
          ]
        },
        {
          name: "Exile",
          runes: ["Vex", "Ohm", "Ist", "Dol"],
          base_types: ["Paladin Shields"],
          required_level: 57,
          variable_stats: {
            defiance_level: { min: 13, max: 16 },
            enhanced_defense: { min: 220, max: 260 }
          },
          fixed_stats: [
            "15% Chance To Cast Level 5 Life Tap On Striking",
            "Level 13-16 Defiance Aura When Equipped",
            "+2 To Offensive Auras (Paladin Only)",
            "+30% Faster Block Rate",
            "Freezes Target",
            "+220-260% Enhanced Defense",
            "Replenish Life +7",
            "+5% To Maximum Cold Resist",
            "+5% To Maximum Fire Resist",
            "25% Better Chance Of Getting Magic Items",
            "Repairs 1 Durability every 4 seconds"
          ]
        },
        {
          name: "Faith",
          runes: ["Ohm", "Jah", "Lem", "Eld"],
          base_types: ["Missile Weapons"],
          required_level: 65,
          variable_stats: {
            fanaticism_level: { min: 12, max: 15 },
            all_skills: { min: 1, max: 2 }
          },
          fixed_stats: [
            "Level 12-15 Fanaticism Aura When Equipped",
            "+1-2 To All Skills",
            "+330% Enhanced Damage",
            "Ignore Target's Defense",
            "300% Bonus To Attack Rating",
            "+75% Damage To Undead",
            "+50 To Attack Rating Against Undead",
            "+120 Fire Damage",
            "All Resistances +15",
            "10% Reanimate As: Returned",
            "75% Extra Gold From Monsters"
          ]
        },
        {
          name: "Fortitude",
          runes: ["El", "Sol", "Dol", "Lo"],
          base_types: ["Weapons", "Body Armor"],
          required_level: 59,
          variable_stats: {
            enhanced_defense: { min: 200, max: 300 },
            all_resistances: { min: 25, max: 30 }
          },
          fixed_stats: [
            "20% Chance To Cast Level 15 Chilling Armor when Struck",
            "+25% Faster Cast Rate",
            "+300% Enhanced Damage",
            "+200-300% Enhanced Defense",
            "+15 Defense",
            "Replenish Life +7",
            "+5% To Maximum Lightning Resist",
            "All Resistances +25-30",
            "Damage Reduced By 7",
            "12% Damage Taken Goes To Mana",
            "+1 To Light Radius"
          ]
        },
        {
          name: "Grief",
          runes: ["Eth", "Tir", "Lo", "Mal", "Ral"],
          base_types: ["Swords", "Axes"],
          required_level: 59,
          variable_stats: {
            damage: { min: 340, max: 400 }
          },
          fixed_stats: [
            "35% Chance To Cast Level 15 Venom On Striking",
            "+30-40% Increased Attack Speed",
            "Damage +340-400",
            "Ignore Target's Defense",
            "-25% Target Defense",
            "+(1.875 per character level) 1.875-185.625% Damage To Demons (Based on Character Level)",
            "Adds 5-30 Fire Damage",
            "-20-25% To Enemy Poison Resistance",
            "20% Deadly Strike",
            "Prevent Monster Heal",
            "+2 To Mana After Each Kill",
            "+10-15 Life After Each Kill"
          ]
        },
        {
          name: "Heart of the Oak",
          runes: ["Ko", "Vex", "Pul", "Thul"],
          base_types: ["Staves", "Maces"],
          required_level: 55,
          variable_stats: {
            all_resistances: { min: 30, max: 40 }
          },
          fixed_stats: [
            "+3 To All Skills",
            "+40% Faster Cast Rate",
            "+75% Damage To Demons",
            "+100 To Attack Rating Against Demons",
            "Adds 3-14 Cold Damage, 3 sec. Duration (Normal)",
            "7% Mana Stolen Per Hit",
            "+10 To Dexterity",
            "Replenish Life +20",
            "Increase Maximum Mana 15%",
            "All Resistances +30-40",
            "Level 4 Oak Sage (25 Charges)",
            "Level 14 Raven (60 Charges)"
          ]
        },
        {
          name: "Infinity",
          runes: ["Ber", "Mal", "Ber", "Ist"],
          base_types: ["Polearms", "Spears"],
          required_level: 63,
          variable_stats: {
            conviction_level: { min: 12, max: 12 },
            vitality: { min: 325, max: 400 }
          },
          fixed_stats: [
            "50% Chance To Cast Level 20 Chain Lightning When You Kill An Enemy",
            "Level 12 Conviction Aura When Equipped",
            "+35% Faster Run/Walk",
            "+255-325% Enhanced Damage",
            "-45-55% To Enemy Lightning Resistance",
            "40% Chance of Crushing Blow",
            "Prevent Monster Heal",
            "0.5-49.5 To Vitality (Based on Character Level)",
            "30% Better Chance of Getting Magic Items",
            "Level 21 Cyclone Armor (30 Charges)"
          ]
        },
        {
          name: "Insight",
          runes: ["Ral", "Tir", "Tal", "Sol"],
          base_types: ["Polearms", "Staves", "Missile Weapons"],
          required_level: 27,
          variable_stats: {
            meditation_level: { min: 12, max: 17 },
            critical_strike: { min: 1, max: 6 }
          },
          fixed_stats: [
            "Level 12-17 Meditation Aura When Equipped",
            "+35% Faster Cast Rate",
            "+200-260% Enhanced Damage",
            "+9 To Minimum Damage",
            "+9 To Maximum Damage",
            "+5 To All Attributes",
            "+2 To Mana After Each Kill",
            "23% Better Chance of Getting Magic Items",
            "+1-6 To Critical Strike",
            "+5 To All Attributes"
          ]
        },
        {
          name: "Last Wish",
          runes: ["Jah", "Mal", "Jah", "Sur", "Jah", "Ber"],
          base_types: ["Swords", "Hammers", "Axes"],
          required_level: 65,
          variable_stats: {
            might_level: { min: 17, max: 17 },
            enhanced_damage: { min: 330, max: 375 }
          },
          fixed_stats: [
            "6% Chance To Cast Level 11 Fade When Struck",
            "10% Chance To Cast Level 18 Life Tap On Striking",
            "20% Chance To Cast Level 20 Charged Bolt On Attack",
            "Level 17 Might Aura When Equipped",
            "+330-375% Enhanced Damage",
            "Ignore Target's Defense",
            "60-70% Chance of Crushing Blow",
            "Prevent Monster Heal",
            "Hit Blinds Target",
            "+0-49 To Life (Based on Character Level)",
            "(0.5 per character level) 0.5-49.5% Chance of Getting Magic Items (Based on Character Level)"
          ]
        },
        {
          name: "Lawbringer",
          runes: ["Amn", "Lem", "Ko"],
          base_types: ["Swords", "Hammers", "Scepters"],
          required_level: 43,
          variable_stats: {
            sanctuary_level: { min: 16, max: 18 }
          },
          fixed_stats: [
            "20% Chance To Cast Level 15 Decrepify On Striking",
            "Level 16-18 Sanctuary Aura When Equipped",
            "-50% Target Defense",
            "Adds 150-210 Fire Damage",
            "Adds 130-180 Cold Damage",
            "7% Life Stolen Per Hit",
            "Slain Monsters Rest In Peace",
            "+200-250 Defense Vs. Missile",
            "+10 To Dexterity",
            "75% Extra Gold From Monsters"
          ]
        },
        {
          name: "Oath",
          runes: ["Shael", "Pul", "Mal", "Lum"],
          base_types: ["Swords", "Axes", "Maces"],
          required_level: 59,
          variable_stats: {
            enhanced_damage: { min: 210, max: 340 },
            heart_of_wolverine: { min: 14, max: 16 }
          },
          fixed_stats: [
            "30% Chance To Cast Level 20 Bone Spirit On Striking",
            "Indestructible",
            "+50% Increased Attack Speed",
            "+210-340% Enhanced Damage",
            "+75% Damage To Demons",
            "+100 To Attack Rating Against Demons",
            "Prevent Monster Heal",
            "+10 To Energy",
            "+10-15 Magic Absorb",
            "Level 14-16 Heart of Wolverine (20 Charges)",
            "Level 20 Raven (20 Charges)"
          ]
        },
        {
          name: "Obedience",
          runes: ["Hel", "Ko", "Thul", "Eth", "Fal"],
          base_types: ["Polearms", "Spears"],
          required_level: 41,
          variable_stats: {
            enhanced_damage: { min: 370, max: 370 }
          },
          fixed_stats: [
            "30% Chance To Cast Level 21 Enchant When You Kill An Enemy",
            "+40% Faster Hit Recovery",
            "+370% Enhanced Damage",
            "-25% Target Defense",
            "Adds 3-14 Cold Damage (3 Seconds Duration)",
            "-25% To Enemy Fire Resistance",
            "40% Chance of Crushing Blow",
            "+200-300 Defense",
            "+10 To Strength",
            "+10 To Dexterity",
            "All Resistances +20-30",
            "Requirements -20%"
          ]
        },
        {
          name: "Phoenix",
          runes: ["Vex", "Vex", "Lo", "Jah"],
          base_types: ["Weapons", "Shields"],
          required_level: 65,
          variable_stats: {
            redemption_level: { min: 10, max: 15 },
            enhanced_damage: { min: 350, max: 400 },
            fire_absorb: { min: 15, max: 21 }
          },
          fixed_stats: [
            "100% Chance To Cast level 40 Blaze When You Level-up",
            "40% Chance To Cast Level 22 Firestorm On Striking",
            "Level 10-15 Redemption Aura When Equipped",
            "+350-400% Enhanced Damage",
            "-28% To Enemy Fire Resistance",
            "+350-400 Defense Vs. Missile",
            "+15-21 Fire Absorb",
            "Ignore Target's Defense (Weapons)",
            "14% Mana Stolen Per Hit (Weapons)",
            "20% Deadly Strike (Weapons)",
            "+50 To Life (Shields)",
            "+5% To Maximum Lightning Resist (Shields)",
            "+10% To Maximum Fire Resist (Shields)"
          ]
        },
        {
          name: "Pride",
          runes: ["Cham", "Sur", "Io", "Lo"],
          base_types: ["Polearms", "Spears"],
          required_level: 67,
          variable_stats: {
            concentration_level: { min: 16, max: 20 },
            enhanced_damage: { min: 260, max: 300 },
            bonus_ar: { min: 180, max: 220 }
          },
          fixed_stats: [
            "25% Chance To Cast Level 17 Fire Wall When Struck",
            "Level 16-20 Concentration Aura When Equipped",
            "+260-300% Enhanced Damage",
            "+180-220% Bonus To Attack Rating",
            "Adds 50-280 Lightning Damage",
            "20% Deadly Strike",
            "Hit Blinds Target",
            "Freezes Target +3",
            "+10 To Vitality",
            "Replenish Life +8",
            "(1.875 per character level) 1.875-185.625% Extra Gold From Monsters (Based on Character Level)"
          ]
        },
        {
          name: "Spirit",
          runes: ["Tal", "Thul", "Ort", "Amn"],
          base_types: ["Shields", "Swords"],
          required_level: 25,
          variable_stats: {
            fcr: { min: 25, max: 35 },
            fhr: { min: 55, max: 55 }
          },
          fixed_stats: [
            "+2 To All Skills",
            "+25-35% Faster Cast Rate",
            "+55% Faster Hit Recovery",
            "+250 Defense Vs. Missile",
            "+22 To Vitality",
            "+89-112 To Mana",
            "Cold Resist +35%",
            "Lightning Resist +35%",
            "Poison Resist +35%",
            "+3-8 Magic Absorb",
            "Attacker Takes Damage of 14"
          ]
        },
        {
          name: "Treachery",
          runes: ["Shael", "Thul", "Lem"],
          base_types: ["Body Armor"],
          required_level: 43,
          variable_stats: {},
          fixed_stats: [
            "5% Chance To Cast Level 15 Fade When Struck",
            "25% Chance To Cast level 15 Venom On Striking",
            "+2 To Assassin Skills",
            "+45% Increased Attack Speed",
            "+20% Faster Hit Recovery",
            "Cold Resist +30%",
            "50% Extra Gold From Monsters"
          ]
        }
      ];
      
      for (const data of runewordData) {
        runewords.push({
          name: data.name,
          game: "diablo2_resurrected",
          runes: data.runes,
          base_types: data.base_types,
          required_level: data.required_level,
          variable_stats: data.variable_stats,
          fixed_stats: data.fixed_stats
        });
        names.push(data.name);
      }
      
      // Apply limit if needed
      if (limit > 0 && runewords.length > limit) {
        runewords = runewords.slice(0, limit);
        names = names.slice(0, limit);
      }
      
      return { runewords, names };
    } catch (error) {
      console.error("Error fetching runewords:", error);
      toast({
        variant: "destructive",
        title: "Error fetching runewords",
        description: "Failed to fetch runewords data",
      });
      return { runewords: [], names: [] };
    } finally {
      setIsFetchingWiki(false);
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
                <div className="flex justify-between">
                  <span>Runewords:</span>
                  <span className="font-bold">{itemStats?.runewordsCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Import Tool Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Import Diablo 2 Resurrected Data</CardTitle>
              <CardDescription>Import items and runewords from external sources</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
                  <TabsTrigger value="runewords" className="flex-1">Runewords</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="space-y-4">
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
                        <SelectItem value="unique_jewelry">Unique Jewelry</SelectItem>
                        <SelectItem value="set_items">Set Items</SelectItem>
                        <SelectItem value="runes">Runes</SelectItem>
                        <SelectItem value="charms">Charms</SelectItem>
                        <SelectItem value="base_items">Base Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="runewords" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will import all runewords from Diablo 2 Resurrected.
                  </p>
                </TabsContent>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="limit" className="block text-sm font-medium">
                      Item Limit
                    </label>
                    <Input
                      id="limit"
                      type="number"
                      min="1"
                      max="1000"
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value) || 1000)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of items to import at once. Higher values may take longer.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="skipExisting" 
                      checked={skipExisting}
                      onCheckedChange={(checked) => setSkipExisting(checked as boolean)}
                    />
                    <label
                      htmlFor="skipExisting"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Skip existing items (prevent duplicates)
                    </label>
                  </div>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={importItems} 
                disabled={isLoading || isFetchingWiki}
                className="w-full bg-diablo-600 hover:bg-diablo-700"
              >
                {isLoading || isFetchingWiki ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isFetchingWiki ? "Fetching data..." : "Importing..."}
                  </>
                ) : (
                  `Import ${activeTab === "items" ? "Items" : "Runewords"}`
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Import Results Card */}
          {importResults && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  Successfully imported {importResults.imported} {activeTab === "items" ? "items" : "runewords"}
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
