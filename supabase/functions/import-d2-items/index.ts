
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

// Import required dependencies
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12';

// Types to match our database schema
type GameType = 'diablo2_resurrected' | 'diablo4';
type ItemCategory = 'weapon' | 'armor' | 'jewelry' | 'charm' | 'rune' | 'consumable' | 'material' | 'unique';
type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique' | 'set' | 'legendary' | 'mythic';

interface Item {
  name: string;
  game: GameType;
  category: ItemCategory;
  base_type?: string;
  rarity: ItemRarity;
  required_level: number;
  stats: string[];
  description?: string;
  image_url?: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { category, limit = 100 } = await req.json();
    
    if (!category) {
      return new Response(
        JSON.stringify({ error: 'Category parameter is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Determine the wiki URL based on the requested category
    let wikiUrl = '';
    let parseFunction: (html: string) => Promise<Item[]>;
    
    switch (category) {
      case 'unique_weapons':
        wikiUrl = 'https://diablo2.diablowiki.net/Unique_Weapons';
        parseFunction = parseUniqueWeapons;
        break;
      case 'unique_armor':
        wikiUrl = 'https://diablo2.diablowiki.net/Unique_Armor';
        parseFunction = parseUniqueArmor;
        break;
      case 'set_items':
        wikiUrl = 'https://diablo2.diablowiki.net/Set_Items';
        parseFunction = parseSetItems;
        break;
      case 'runes':
        wikiUrl = 'https://diablo2.diablowiki.net/Runes';
        parseFunction = parseRunes;
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid category' }),
          { headers: { 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    // Fetch the wiki page
    console.log(`Fetching data from ${wikiUrl}`);
    const response = await fetch(wikiUrl);
    const html = await response.text();
    
    // Parse the HTML
    const items = await parseFunction(html);
    console.log(`Parsed ${items.length} items`);
    
    // Limit the number of items if requested
    const limitedItems = items.slice(0, limit);
    
    // Insert items into the database
    const { data, error } = await supabase
      .from('items')
      .upsert(
        limitedItems.map(item => ({
          ...item,
          // Add any additional fields required by the database
        })),
        { onConflict: 'name' } // Assuming name is unique
      );
    
    if (error) {
      console.error('Error inserting items:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: limitedItems.length,
        items: limitedItems.map(item => item.name)
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred', details: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function parseUniqueWeapons(html: string): Promise<Item[]> {
  const items: Item[] = [];
  const $ = load(html);
  
  // Find the tables containing unique weapons
  $('table.wikitable').each((_, table) => {
    // For each table, process the rows
    $(table).find('tr:not(:first-child)').each((_, row) => {
      const columns = $(row).find('td');
      
      if (columns.length >= 5) {
        const name = $(columns[0]).text().trim();
        const basetype = $(columns[1]).text().trim();
        
        // Extract level requirement from the text
        const levelText = $(columns[2]).text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const requiredLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
        
        // Extract stats from the properties column
        const statsText = $(columns[4]).html() || '';
        const stats = statsText
          .split('<br>')
          .map(stat => $(stat).text().trim())
          .filter(stat => stat.length > 0);
        
        if (name && !name.includes('Table')) {
          items.push({
            name,
            game: 'diablo2_resurrected',
            category: 'weapon',
            base_type: basetype,
            rarity: 'unique',
            required_level: requiredLevel,
            stats,
            description: `A unique ${basetype} in Diablo II: Resurrected.`
          });
        }
      }
    });
  });
  
  return items;
}

async function parseUniqueArmor(html: string): Promise<Item[]> {
  const items: Item[] = [];
  const $ = load(html);
  
  // Similar to unique weapons parsing, but with 'armor' category
  $('table.wikitable').each((_, table) => {
    $(table).find('tr:not(:first-child)').each((_, row) => {
      const columns = $(row).find('td');
      
      if (columns.length >= 5) {
        const name = $(columns[0]).text().trim();
        const basetype = $(columns[1]).text().trim();
        
        const levelText = $(columns[2]).text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const requiredLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
        
        const statsText = $(columns[4]).html() || '';
        const stats = statsText
          .split('<br>')
          .map(stat => $(stat).text().trim())
          .filter(stat => stat.length > 0);
        
        if (name && !name.includes('Table')) {
          items.push({
            name,
            game: 'diablo2_resurrected',
            category: 'armor',
            base_type: basetype,
            rarity: 'unique',
            required_level: requiredLevel,
            stats,
            description: `A unique ${basetype} in Diablo II: Resurrected.`
          });
        }
      }
    });
  });
  
  return items;
}

async function parseSetItems(html: string): Promise<Item[]> {
  const items: Item[] = [];
  const $ = load(html);
  
  // Parse set items which have a different table structure
  $('table.wikitable').each((_, table) => {
    let setName = '';
    
    // Try to find the set name from nearby headings
    const prevHeading = $(table).prev('h3').text().trim();
    if (prevHeading) {
      setName = prevHeading;
    }
    
    $(table).find('tr:not(:first-child)').each((_, row) => {
      const columns = $(row).find('td');
      
      if (columns.length >= 4) {
        const name = $(columns[0]).text().trim();
        const basetype = $(columns[1]).text().trim();
        
        const levelText = $(columns[2]).text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const requiredLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
        
        const statsText = $(columns[3]).html() || '';
        const stats = statsText
          .split('<br>')
          .map(stat => $(stat).text().trim())
          .filter(stat => stat.length > 0);
        
        if (name && !name.includes('Table')) {
          let category: ItemCategory = 'armor';
          
          // Determine category based on base type
          if (/sword|axe|mace|wand|staff|bow|javelin|spear|polearm/i.test(basetype)) {
            category = 'weapon';
          } else if (/amulet|ring/i.test(basetype)) {
            category = 'jewelry';
          }
          
          items.push({
            name,
            game: 'diablo2_resurrected',
            category,
            base_type: basetype,
            rarity: 'set',
            required_level: requiredLevel,
            stats,
            description: setName ? `Part of the ${setName} set in Diablo II: Resurrected.` : undefined
          });
        }
      }
    });
  });
  
  return items;
}

async function parseRunes(html: string): Promise<Item[]> {
  const items: Item[] = [];
  const $ = load(html);
  
  // Parse runes which have a unique table structure
  $('table.wikitable').each((_, table) => {
    $(table).find('tr:not(:first-child)').each((_, row) => {
      const columns = $(row).find('td');
      
      if (columns.length >= 5) {
        const runeText = $(columns[0]).text().trim();
        const nameMatch = runeText.match(/(\w+)\s+Rune/i);
        const name = nameMatch ? `${nameMatch[1]} Rune` : runeText;
        
        const levelText = $(columns[1]).text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const requiredLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
        
        // Get weapon, armor, and shield effects as stats
        const weaponEffect = $(columns[2]).text().trim();
        const armorEffect = $(columns[3]).text().trim();
        const shieldEffect = $(columns[4]).text().trim();
        
        const stats = [
          `Weapon: ${weaponEffect}`,
          `Armor: ${armorEffect}`,
          `Shield: ${shieldEffect}`
        ].filter(stat => stat.length > 8); // Filter out empty effects
        
        if (name && !name.includes('Number')) {
          items.push({
            name,
            game: 'diablo2_resurrected',
            category: 'rune',
            rarity: 'unique',
            required_level: requiredLevel,
            stats,
            description: `A rune that can be socketed into items or used to create runewords.`
          });
        }
      }
    });
  });
  
  return items;
}
