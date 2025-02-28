
export type GameType = 'diablo2_resurrected' | 'diablo4';

export type ItemCategory = 
  | 'weapon' 
  | 'armor' 
  | 'jewelry' 
  | 'charm' 
  | 'rune' 
  | 'consumable'
  | 'material'
  | 'unique';

export type ItemRarity = 
  | 'normal' 
  | 'magic' 
  | 'rare' 
  | 'unique' 
  | 'set' 
  | 'legendary'
  | 'mythic';

export interface Item {
  id: string;
  name: string;
  game: GameType;
  category: ItemCategory;
  base_type?: string;
  rarity: ItemRarity;
  required_level: number;
  image_url?: string;
  stats: string[];
  description?: string;
}

// New interfaces for runewords
export interface VariableStat {
  min: number;
  max: number;
}

export interface RunewordVariableStats {
  [key: string]: VariableStat;
}

export interface Runeword {
  id: string;
  name: string;
  game: GameType;
  runes: string[];
  base_types: string[];
  required_level: number;
  variable_stats: RunewordVariableStats;
  fixed_stats: string[];
  created_at: string;
  updated_at: string;
}
