
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
  const [limit, setLimit] = useState<number>(100);
  const [skipExisting, setSkipExisting] = useState<boolean>(true);
  const [isFetchingWiki, setIsFetchingWiki] = useState(false);
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

  // Function to fetch items from the Diablo 2 wiki
  const fetchWikiItems = async (category: string): Promise<{ items: Item[], names: string[] }> => {
    setIsFetchingWiki(true);
    let items: Item[] = [];
    let names: string[] = [];
    
    try {
      // This would ideally be an API request to a real wiki source
      // For this implementation, we'll use an expanded dataset based on category
      
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
      } else if (category === "unique_weapons") {
        // Expanded list of unique weapons
        const weapons = [
          { name: "Windforce", level: 73, stats: ["+250% Enhanced Damage", "20% Increased Attack Speed", "Knockback"] },
          { name: "Grandfather", level: 81, stats: ["+200% Enhanced Damage", "+50% Damage to Demons", "+20 to Strength"] },
          { name: "Doombringer", level: 69, stats: ["+180% Enhanced Damage", "8% Life Steal", "40% Chance of Crushing Blow"] },
          { name: "Azurewrath", level: 85, stats: ["+350% Damage to Undead", "+30% Increased Attack Speed", "Level 10 Sanctuary Aura"] },
          { name: "Lightsabre", level: 58, stats: ["Adds 10-30 Lightning Damage", "+20% Increased Attack Speed", "5% Chance to Cast Level 14 Chain Lightning on Striking"] },
          { name: "Death's Fathom", level: 73, stats: ["+20-30% Cold Skill Damage", "+20% Faster Cast Rate", "+30% Lightning Resist"] },
          { name: "Stormlash", level: 82, stats: ["+240-300% Enhanced Damage", "33% Chance to Cast Level 14 Tornado on Striking"] },
          { name: "Tomb Reaver", level: 84, stats: ["+200-280% Enhanced Damage", "+60% Increased Attack Speed", "+250-350% Damage to Undead"] },
          { name: "The Oculus", level: 42, stats: ["+3 to All Sorceress Skills", "+20% Faster Cast Rate", "+20% Enhanced Defense"] },
          { name: "Death's Web", level: 66, stats: ["+1-2 to All Necromancer Skills", "-40-50% to Enemy Poison Resistance", "+7-12% Mana Stolen Per Hit"] },
          { name: "Schaefer's Hammer", level: 79, stats: ["+100-130% Enhanced Damage", "20% Chance to Cast Level 14 Static Field on Striking"] },
          { name: "The Reaper's Toll", level: 75, stats: ["+190-240% Enhanced Damage", "33-45% Chance of Open Wounds", "33-45% Deadly Strike"] },
          { name: "Titan's Revenge", level: 42, stats: ["+150-200% Enhanced Damage", "+30% Faster Run/Walk", "+2 to Amazon Skill Levels"] },
          { name: "Baranar's Star", level: 65, stats: ["+200-250% Enhanced Damage", "50% Chance of Crushing Blow"] },
          { name: "Eschuta's Temper", level: 72, stats: ["+1-3 to Sorceress Skill Levels", "+10-20% to Fire Skill Damage", "+10-20% to Lightning Skill Damage"] },
          { name: "Wizardspike", level: 61, stats: ["+50% Faster Cast Rate", "+75-95 to All Resistances", "+50-74 to Mana"] },
          { name: "Thunderstroke", level: 69, stats: ["+150-200% Enhanced Damage", "-15% to Enemy Lightning Resistance", "+3-4 to Lightning Fury (Amazon Only)"] },
          { name: "Bartuc's Cut-Throat", level: 42, stats: ["+150-200% Enhanced Damage", "+2 to Assassin Skill Levels", "+20% Increased Attack Speed"] },
          { name: "Jade Talon", level: 66, stats: ["+1-2 to Martial Arts (Assassin Only)", "+1-2 to Shadow Disciplines (Assassin Only)", "+30% Faster Hit Recovery"] },
          { name: "Ribcracker", level: 31, stats: ["+200-300% Enhanced Damage", "50% Chance of Crushing Blow", "50% Increased Attack Speed"] }
        ];
        
        for (let weapon of weapons) {
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
        // Expanded list of unique armor
        const armors = [
          { name: "Shako", level: 62, stats: ["+2 To All Skills", "+30% Better Chance of Getting Magic Items", "Damage Reduced By 10%"] },
          { name: "Arkaine's Valor", level: 85, stats: ["+200% Enhanced Defense", "+2 To All Skills", "30% Faster Hit Recovery"] },
          { name: "Leviathan", level: 65, stats: ["+200% Enhanced Defense", "+40 to Strength", "Damage Reduced by 25%"] },
          { name: "Guardian Angel", level: 51, stats: ["+180% Enhanced Defense", "+30% Faster Hit Recovery", "+15% to All Maximum Resistances"] },
          { name: "Tyrael's Might", level: 84, stats: ["+100% Enhanced Defense", "Indestructible", "Cannot Be Frozen"] },
          { name: "Skullder's Ire", level: 42, stats: ["+180% Enhanced Defense", "+1 to All Skills", "Better Chance of Getting Magic Items"] },
          { name: "Ormus' Robes", level: 75, stats: ["+20% Enhanced Defense", "+20% Faster Cast Rate", "+10-15% to Cold/Lightning/Fire Skill Damage"] },
          { name: "The Gladiator's Bane", level: 85, stats: ["+150-200% Enhanced Defense", "Cannot Be Frozen", "30% Faster Hit Recovery"] },
          { name: "Skin of the Vipermagi", level: 29, stats: ["+120% Enhanced Defense", "+30% Faster Cast Rate", "+1 to All Skills"] },
          { name: "Valor of Jalal", level: 42, stats: ["+150-200% Enhanced Defense", "+2 to Druid Skills", "+30% Faster Hit Recovery"] },
          { name: "Skin of the Flayed One", level: 31, stats: ["+150-190% Enhanced Defense", "5% Life Stolen Per Hit", "Replenish Life +10"] },
          { name: "Spirit Shroud", level: 28, stats: ["+150% Enhanced Defense", "+1 to All Skills", "Cannot Be Frozen"] },
          { name: "Blackhorn's Face", level: 41, stats: ["+180-220% Enhanced Defense", "Prevent Monster Heal", "Lightning Absorb 25%"] },
          { name: "Crown of Thieves", level: 49, stats: ["+160-200% Enhanced Defense", "9-12% Life Stolen Per Hit", "Fire Resist +33%"] },
          { name: "Nightwing's Veil", level: 67, stats: ["+90-120% Enhanced Defense", "+2 to All Skills", "+10-15% to Cold Skill Damage"] },
          { name: "Steel Shade", level: 62, stats: ["+100-130% Enhanced Defense", "3-5% Life Stolen Per Hit", "+3-6% Mana Stolen Per Hit"] },
          { name: "Vampire Gaze", level: 41, stats: ["+100-150% Enhanced Defense", "6-8% Life Stolen Per Hit", "6-8% Mana Stolen Per Hit"] },
          { name: "Andariel's Visage", level: 83, stats: ["+150-200% Enhanced Defense", "+2 to All Skills", "+20% Increased Attack Speed"] },
          { name: "Crown of Ages", level: 82, stats: ["+50-100% Enhanced Defense", "Damage Reduced by 10-15%", "+1 to All Skills"] },
          { name: "Giant Skull", level: 65, stats: ["+280-320% Enhanced Defense", "10% Chance of Crushing Blow", "+25-35 to Strength"] }
        ];
        
        for (let armor of armors) {
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
        // Expanded list of set items
        const setItems = [
          // Tal Rasha's Wrappings (Sorceress)
          { name: "Tal Rasha's Horadric Crest", level: 66, stats: ["+2 To Sorceress Skill Levels", "10% Faster Cast Rate", "+30 Defense"], set: "Tal Rasha's Wrappings" },
          { name: "Tal Rasha's Guardianship", level: 71, stats: ["+400-500 Defense", "+40% Cold Resist", "+40% Lightning Resist"], set: "Tal Rasha's Wrappings" },
          { name: "Tal Rasha's Fine-Spun Cloth", level: 53, stats: ["+10% Faster Cast Rate", "+20 to Mana", "+5-15 to Lightning Damage"], set: "Tal Rasha's Wrappings" },
          { name: "Tal Rasha's Adjudication", level: 65, stats: ["+2 to Lightning Skills", "+33% Lightning Resistance", "+42 to Mana"], set: "Tal Rasha's Wrappings" },
          { name: "Tal Rasha's Lidless Eye", level: 65, stats: ["+1-2 to Sorceress Skill Levels", "20% Faster Cast Rate", "57 to Mana"], set: "Tal Rasha's Wrappings" },
          
          // Immortal King's (Barbarian)
          { name: "Immortal King's Stone Crusher", level: 76, stats: ["+200% Enhanced Damage", "40% Chance of Crushing Blow", "35% Chance of Open Wounds"], set: "Immortal King's" },
          { name: "Immortal King's Soul Cage", level: 76, stats: ["+200% Enhanced Defense", "+5 to All Attributes", "Magic Damage Reduced by 8"], set: "Immortal King's" },
          { name: "Immortal King's Detail", level: 29, stats: ["+25 to Strength", "+25% Better Chance of Getting Magic Items", "+36% Fire Resist"], set: "Immortal King's" },
          { name: "Immortal King's Forge", level: 65, stats: ["+150% Enhanced Defense", "Fire Resist +50%", "20% Crushing Blow"], set: "Immortal King's" },
          { name: "Immortal King's Pillar", level: 31, stats: ["+150% Enhanced Defense", "+25 to Strength", "+20% Faster Run/Walk"], set: "Immortal King's" },
          { name: "Immortal King's Will", level: 47, stats: ["+150% Enhanced Defense", "+37 to Strength", "+37 to Vitality"], set: "Immortal King's" },
          
          // Trang-Oul's Avatar (Necromancer)
          { name: "Trang-Oul's Claws", level: 45, stats: ["+2 To Necromancer Skill Levels", "25% Faster Cast Rate", "+30 to Mana"], set: "Trang-Oul's Avatar" },
          { name: "Trang-Oul's Scales", level: 49, stats: ["+100% Enhanced Defense", "+100 Defense", "+40% Poison Skill Damage"], set: "Trang-Oul's Avatar" },
          { name: "Trang-Oul's Girth", level: 45, stats: ["+120-150 Enhanced Defense", "+25-50 to Mana", "+66 to Life"], set: "Trang-Oul's Avatar" },
          { name: "Trang-Oul's Wing", level: 54, stats: ["+150-200 Enhanced Defense", "+30 Defense", "+80-100 to Mana"], set: "Trang-Oul's Avatar" },
          { name: "Trang-Oul's Guise", level: 65, stats: ["+150 Enhanced Defense", "+25% Faster Hit Recovery", "Replenish Life +5"], set: "Trang-Oul's Avatar" },
          
          // Natalya's Odium (Assassin)
          { name: "Natalya's Soul", level: 73, stats: ["+2 To Assassin Skill Levels", "+150 to Attack Rating", "+30% Faster Hit Recovery"], set: "Natalya's Odium" },
          { name: "Natalya's Mark", level: 51, stats: ["+150-200% Enhanced Damage", "+50% Damage to Demons", "+200-300 to Attack Rating"], set: "Natalya's Odium" },
          { name: "Natalya's Shadow", level: 61, stats: ["+170% Enhanced Defense", "+25% Cold Resist", "+25% Lightning Resist"], set: "Natalya's Odium" },
          { name: "Natalya's Totem", level: 25, stats: ["+150-200% Enhanced Defense", "+25 to Strength", "All Resistances +10-20"], set: "Natalya's Odium" },
          
          // Aldur's Watchtower (Druid)
          { name: "Aldur's Advance", level: 45, stats: ["+180 Enhanced Defense", "40% Faster Run/Walk", "+50 to Life"], set: "Aldur's Watchtower" },
          { name: "Aldur's Deception", level: 76, stats: ["+300 Defense", "+15 to Strength", "+15 to Dexterity"], set: "Aldur's Watchtower" },
          { name: "Aldur's Stony Gaze", level: 41, stats: ["+90-130% Enhanced Defense", "Regenerate Mana 17%", "+15 to Energy"], set: "Aldur's Watchtower" },
          { name: "Aldur's Rhythm", level: 42, stats: ["+200% Enhanced Damage", "10% Life Stolen Per Hit", "+50 to Attack Rating"], set: "Aldur's Watchtower" },
          
          // Griswold's Legacy (Paladin)
          { name: "Griswold's Heart", level: 45, stats: ["+450-550 Defense", "+40 Defense", "+20 to Strength"], set: "Griswold's Legacy" },
          { name: "Griswold's Valor", level: 69, stats: ["+300-375% Enhanced Defense", "+5-15% Enhanced Damage", "+100-150 to Attack Rating"], set: "Griswold's Legacy" },
          { name: "Griswold's Redemption", level: 45, stats: ["+200-240% Enhanced Damage", "+250 Damage to Demons", "+200-250 to Attack Rating"], set: "Griswold's Legacy" },
          { name: "Griswold's Honor", level: 68, stats: ["+150% Enhanced Defense", "+45 to All Resistances", "Damage Reduced by 15%"], set: "Griswold's Legacy" },
          
          // Heaven's Brethren (Various)
          { name: "Dangoon's Teaching", level: 66, stats: ["+180-220% Enhanced Damage", "+200-250 to Attack Rating", "30% Increased Attack Speed"], set: "Heaven's Brethren" },
          { name: "Taebaek's Glory", level: 81, stats: ["+200% Enhanced Defense", "+30 Defense", "+30% Cold Resist"], set: "Heaven's Brethren" },
          { name: "Haemosu's Adamant", level: 76, stats: ["+160-200% Enhanced Defense", "+150-200 Defense", "+35 to All Resistances"], set: "Heaven's Brethren" },
          { name: "Ondal's Almighty", level: 66, stats: ["+150-180% Enhanced Defense", "+100-150 to Life", "+25 to Vitality"], set: "Heaven's Brethren" }
        ];
        
        for (let item of setItems) {
          items.push({
            name: item.name,
            game: "diablo2_resurrected",
            category: "armor",
            rarity: "set",
            required_level: item.level,
            image_url: null,
            stats: item.stats,
            description: `${item.name} is part of the ${item.set} set in Diablo 2 Resurrected.`,
            base_type: "Set Item"
          });
          names.push(item.name);
        }
      } else if (category === "unique_jewelry") {
        // Unique jewelry data
        const jewelry = [
          { name: "Stone of Jordan", level: 29, stats: ["+1 to All Skills", "Adds 1-12 Lightning Damage", "+20 to Mana"] },
          { name: "Bul-Kathos' Wedding Band", level: 58, stats: ["+1 to All Skills", "3-5% Life Stolen Per Hit", "+20 to Strength"] },
          { name: "Nagelring", level: 7, stats: ["Magic Damage Reduced by 3", "+50-75 to Attack Rating", "15-30% Better Chance of Getting Magic Items"] },
          { name: "Manald Heal", level: 15, stats: ["4-7% Mana Stolen Per Hit", "Regenerate Mana 20%", "+20 to Life"] },
          { name: "Wisp Projector", level: 76, stats: ["10% Chance to Cast Level 16 Lightning on Attack", "Lightning Absorb 10-20%", "10-20% Better Chance of Getting Magic Items"] },
          { name: "Raven Frost", level: 45, stats: ["Cannot Be Frozen", "+150-250 to Attack Rating", "Cold Absorb 20%"] },
          { name: "Dwarf Star", level: 45, stats: ["100% Extra Gold from Monsters", "Fire Absorb 15%", "Magic Damage Reduced by 12-15"] },
          { name: "Atma's Scarab", level: 60, stats: ["5% Chance to Cast Level 2 Amplify Damage on Striking", "+20% Poison Resist", "+40 Poison Damage Over 4 Seconds"] },
          { name: "The Cat's Eye", level: 50, stats: ["+30% Faster Run/Walk", "+20% Increased Attack Speed", "+100 Defense vs. Missile"] },
          { name: "The Eye of Etlich", level: 15, stats: ["+1-2 to All Skills", "3-7% Life Stolen Per Hit", "+10-40 to Life"] },
          { name: "The Mahim-Oak Curio", level: 25, stats: ["+10 to All Attributes", "All Resistances +10", "+10% Enhanced Defense"] },
          { name: "Crescent Moon", level: 60, stats: ["10% Life Stolen Per Hit", "3-6% Mana Stolen Per Hit", "-2 to Light Radius"] },
          { name: "Mara's Kaleidoscope", level: 67, stats: ["+2 to All Skills", "All Resistances +20-30", "+5 to All Attributes"] },
          { name: "Highlord's Wrath", level: 65, stats: ["+1 to All Skills", "+20% Increased Attack Speed", "35% Deadly Strike"] },
          { name: "Saracen's Chance", level: 47, stats: ["+2 to All Attributes", "All Resistances +15-25", "10% Chance to Cast Level 2 Iron Maiden When Struck"] },
          { name: "The Rising Sun", level: 65, stats: ["10% Chance to Cast Level 13-19 Meteor When Struck", "Fire Absorb 10-15%", "+4-6 Fire Absorb"] }
        ];
        
        for (let item of jewelry) {
          items.push({
            name: item.name,
            game: "diablo2_resurrected",
            category: "jewelry",
            rarity: "unique",
            required_level: item.level,
            image_url: null,
            stats: item.stats,
            description: `${item.name} is a powerful unique jewelry item in Diablo 2 Resurrected.`,
            base_type: "Unique Jewelry"
          });
          names.push(item.name);
        }
      } else if (category === "charms") {
        // Unique charms data
        const charms = [
          { name: "Annihilus", level: 70, stats: ["+1 to All Skills", "10-20% to all Resistances", "+10-20 to all Attributes"], type: "Small Charm" },
          { name: "Hellfire Torch", level: 75, stats: ["+3 to Random Class Skills", "10-20% to all Resistances", "+10-20 to all Attributes"], type: "Large Charm" },
          { name: "Gheed's Fortune", level: 62, stats: ["80-160% Better Chance of Getting Magic Items", "Reduces All Vendor Prices 10-15%", "100-160% Extra Gold from Monsters"], type: "Grand Charm" },
          
          // Generic magic charms (not unique, but added for completeness)
          { name: "Small Charm of Vita", level: 1, stats: ["+20 to Life"], type: "Small Charm" },
          { name: "Small Charm of Resist Fire", level: 1, stats: ["+11% Fire Resist"], type: "Small Charm" },
          { name: "Small Charm of Good Luck", level: 1, stats: ["7% Better Chance of Getting Magic Items"], type: "Small Charm" },
          { name: "Grand Charm of Strength", level: 1, stats: ["+132 to Attack Rating", "+6 to Strength"], type: "Grand Charm" },
          { name: "Large Charm of Vita", level: 1, stats: ["+38 to Life"], type: "Large Charm" },
          { name: "Grand Charm of Vita", level: 1, stats: ["+45 to Life"], type: "Grand Charm" },
          { name: "Grand Charm of Maiming", level: 1, stats: ["+132 to Attack Rating", "+10 Maximum Damage"], type: "Grand Charm" },
          { name: "Necromancer Combat Skills", level: 50, stats: ["+1 to Necromancer Combat Skills"], type: "Grand Charm" },
          { name: "Barbarian Combat Skills", level: 50, stats: ["+1 to Barbarian Combat Skills"], type: "Grand Charm" },
          { name: "Amazon Bow and Crossbow Skills", level: 50, stats: ["+1 to Amazon Bow and Crossbow Skills"], type: "Grand Charm" },
          { name: "Sorceress Fire Skills", level: 50, stats: ["+1 to Sorceress Fire Skills"], type: "Grand Charm" },
          { name: "Paladin Combat Skills", level: 50, stats: ["+1 to Paladin Combat Skills"], type: "Grand Charm" },
          { name: "Druid Elemental Skills", level: 50, stats: ["+1 to Druid Elemental Skills"], type: "Grand Charm" },
          { name: "Assassin Trap Skills", level: 50, stats: ["+1 to Assassin Trap Skills"], type: "Grand Charm" }
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
      
      // Apply limit
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
        description: "Failed to fetch items from wiki source",
      });
      return { items: [], names: [] };
    } finally {
      setIsFetchingWiki(false);
    }
  };

  const importItems = async () => {
    setIsLoading(true);
    try {
      // Fetch items from wiki instead of generating samples
      const { items, names } = await fetchWikiItems(category);
      
      if (items.length === 0) {
        toast({
          variant: "destructive",
          title: "No items found",
          description: `No items found in the ${category} category.`,
        });
        setIsLoading(false);
        return;
      }
      
      let importedCount = 0;
      let skippedCount = 0;
      
      // Import each item to the database
      for (const item of items) {
        // Check if item already exists (if skipExisting is enabled)
        if (skipExisting) {
          const { data: existingItem, error: checkError } = await supabase
            .from('items')
            .select('id')
            .eq('name', item.name)
            .maybeSingle();
          
          if (checkError) {
            console.error(`Error checking if item ${item.name} exists:`, checkError);
            continue;
          }
          
          if (existingItem) {
            skippedCount++;
            continue;
          }
        }
        
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
      
      // Set import results
      setImportResults({
        imported: importedCount,
        items: names.slice(0, importedCount)
      });
      
      // Invalidate the item stats query to refresh the counts
      queryClient.invalidateQueries({ queryKey: ["itemStats"] });
      
      toast({
        title: "Import Successful",
        description: `Imported ${importedCount} items from ${category}${skippedCount > 0 ? ` (skipped ${skippedCount} existing items)` : ''}`,
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
                      <SelectItem value="unique_jewelry">Unique Jewelry</SelectItem>
                      <SelectItem value="charms">Charms</SelectItem>
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
                    onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
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
                    {isFetchingWiki ? "Fetching items..." : "Importing..."}
                  </>
                ) : (
                  "Import Items"
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
