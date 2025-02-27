
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemCategory, GameType } from "@/types/items";

interface ItemFiltersProps {
  filters: {
    game: GameType;
    category: ItemCategory | "";
    minLevel: string;
    maxLevel: string;
  };
  onFilterChange: (filters: ItemFiltersProps["filters"]) => void;
}

const ItemFilters = ({ filters, onFilterChange }: ItemFiltersProps) => {
  const handleInputChange = (field: keyof typeof filters, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-secondary p-6 rounded-lg space-y-4">
      <h3 className="font-bold text-lg mb-4">Filters</h3>
      
      <div className="space-y-2">
        <Label htmlFor="game">Game</Label>
        <Select
          value={filters.game}
          onValueChange={(value) => handleInputChange("game", value as GameType)}
        >
          <SelectTrigger id="game" className="bg-background">
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diablo4">Diablo IV</SelectItem>
            <SelectItem value="diablo2_resurrected">Diablo II: Resurrected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => handleInputChange("category", value as ItemCategory)}
        >
          <SelectTrigger id="category" className="bg-background">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
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
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="minLevel">Min Level</Label>
          <Input
            id="minLevel"
            type="number"
            placeholder="Min"
            className="bg-background"
            value={filters.minLevel}
            onChange={(e) => handleInputChange("minLevel", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxLevel">Max Level</Label>
          <Input
            id="maxLevel"
            type="number"
            placeholder="Max"
            className="bg-background"
            value={filters.maxLevel}
            onChange={(e) => handleInputChange("maxLevel", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemFilters;
