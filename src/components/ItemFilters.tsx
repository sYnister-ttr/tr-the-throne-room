
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemCategory, GameType, ItemRarity } from "@/types/items";
import { Dispatch, SetStateAction } from "react";

interface ItemFiltersProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  gameFilter: GameType | "all";
  setGameFilter: Dispatch<SetStateAction<GameType | "all">>;
  categoryFilter: ItemCategory | "all";
  setCategoryFilter: Dispatch<SetStateAction<ItemCategory | "all">>;
  rarityFilter: ItemRarity | "all";
  setRarityFilter: Dispatch<SetStateAction<ItemRarity | "all">>;
  levelFilter: number | null;
  setLevelFilter: Dispatch<SetStateAction<number | null>>;
}

const ItemFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  gameFilter, 
  setGameFilter, 
  categoryFilter, 
  setCategoryFilter, 
  rarityFilter, 
  setRarityFilter, 
  levelFilter, 
  setLevelFilter 
}: ItemFiltersProps) => {
  return (
    <div className="bg-secondary/30 p-6 rounded-lg space-y-4">
      <h3 className="font-bold text-lg mb-4">Filters</h3>
      
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="game">Game</Label>
        <Select
          value={gameFilter}
          onValueChange={(value) => setGameFilter(value as GameType | "all")}
        >
          <SelectTrigger id="game" className="bg-background">
            <SelectValue placeholder="All games" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="diablo4">Diablo IV</SelectItem>
            <SelectItem value="diablo2_resurrected">Diablo II: Resurrected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as ItemCategory | "all")}
        >
          <SelectTrigger id="category" className="bg-background">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="weapon">Weapons</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="jewelry">Jewelry</SelectItem>
            <SelectItem value="charm">Charms</SelectItem>
            <SelectItem value="rune">Runes</SelectItem>
            <SelectItem value="consumable">Consumables</SelectItem>
            <SelectItem value="material">Materials</SelectItem>
            <SelectItem value="unique">Uniques</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rarity">Rarity</Label>
        <Select
          value={rarityFilter}
          onValueChange={(value) => setRarityFilter(value as ItemRarity | "all")}
        >
          <SelectTrigger id="rarity" className="bg-background">
            <SelectValue placeholder="All rarities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="magic">Magic</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="unique">Unique</SelectItem>
            <SelectItem value="set">Set</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="mythic">Mythic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="level">Maximum Level Requirement</Label>
        <Input
          id="level"
          type="number"
          placeholder="Any level"
          value={levelFilter || ""}
          onChange={(e) => setLevelFilter(e.target.value ? parseInt(e.target.value) : null)}
          className="bg-background"
        />
      </div>
    </div>
  );
};

export default ItemFilters;
