
import { ItemCategory, ItemRarity } from "@/types/items";

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'normal':
      return 'gray-200';
    case 'magic':
      return 'blue-400';
    case 'rare':
      return 'yellow-400';
    case 'unique':
      return 'amber-500';
    case 'set':
      return 'green-400';
    case 'legendary':
      return 'orange-400';
    case 'mythic':
      return 'purple-400';
    default:
      return 'white';
  }
}

export function getCategoryColor(category: ItemCategory): string {
  switch (category) {
    case 'weapon':
      return 'red-600';
    case 'armor':
      return 'blue-600';
    case 'jewelry':
      return 'purple-600';
    case 'charm':
      return 'green-600';
    case 'rune':
      return 'yellow-600';
    case 'consumable':
      return 'pink-600';
    case 'material':
      return 'orange-600';
    case 'unique':
      return 'amber-600';
    default:
      return 'gray-600';
  }
}
