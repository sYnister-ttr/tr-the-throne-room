
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { category, limit = 50 } = await req.json();
    console.log(`Importing category: ${category}, limit: ${limit}`);

    if (!category) {
      return new Response(
        JSON.stringify({ error: "Category is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Set up import variables based on category
    let items = [];
    let importedItemNames = [];
    
    // This is a simplified implementation - in a real system, you would
    // fetch this data from an external source like a wiki API
    if (category === "runes") {
      // Generate some sample rune data for D2R
      const runeNames = ["El", "Eld", "Tir", "Nef", "Eth", "Ith", "Tal", "Ral", "Ort", "Thul", 
                       "Amn", "Sol", "Shael", "Dol", "Hel", "Io", "Lum", "Ko", "Fal", "Lem", 
                       "Pul", "Um", "Mal", "Ist", "Gul", "Vex", "Ohm", "Lo", "Sur", "Ber", "Jah", 
                       "Cham", "Zod"];
      
      const runeDescriptions = {
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
        items.push({
          name: name + " Rune",
          game: "diablo2_resurrected",
          category: "rune",
          rarity: "unique",
          required_level: 1 + (i * 2), // Higher runes require higher levels
          image_url: null,
          stats: [runeDescriptions[name]],
          description: `${name} is rune #${i+1} in Diablo 2 Resurrected.`,
          base_type: "Rune"
        });
        importedItemNames.push(name + " Rune");
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
        importedItemNames.push(weapon.name);
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
        importedItemNames.push(armor.name);
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
        importedItemNames.push(item.name);
      }
    }

    // Import items to database
    let importedCount = 0;
    
    for (const item of items) {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('items')
        .select('id')
        .eq('name', item.name)
        .single();

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

    return new Response(
      JSON.stringify({
        imported: importedCount,
        items: importedItemNames,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
