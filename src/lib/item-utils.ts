
export const getRarityColor = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'normal':
      return 'zinc-200';
    case 'magic':
      return 'blue-400';
    case 'rare':
      return 'yellow-400';
    case 'unique':
      return 'amber-500';
    case 'set':
      return 'green-500';
    case 'legendary':
      return 'orange-500';
    case 'mythic':
      return 'purple-500';
    default:
      return 'zinc-200';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category?.toLowerCase()) {
    case 'weapon':
      return 'red-500';
    case 'armor':
      return 'blue-500';
    case 'jewelry':
      return 'yellow-500';
    case 'charm':
      return 'green-500';
    case 'rune':
      return 'amber-500';
    case 'consumable':
      return 'cyan-500';
    case 'material':
      return 'purple-500';
    case 'unique':
      return 'orange-500';
    default:
      return 'zinc-500';
  }
};
