
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
