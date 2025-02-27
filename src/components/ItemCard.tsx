
import { Item } from "@/types/items";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor, getRarityColor } from "@/lib/item-utils";

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  // Get color classes
  const rarityColor = getRarityColor(item.rarity);
  const categoryColor = getCategoryColor(item.category);

  // Convert dynamic class names to inline styles
  const getBorderStyle = () => {
    return { borderColor: `var(--${rarityColor})` };
  };
  
  const getTitleStyle = () => {
    return { color: `var(--${rarityColor})` };
  };
  
  const getBadgeStyle = () => {
    return { backgroundColor: `var(--${categoryColor})` };
  };

  return (
    <Card className="border hover:shadow-md transition-all" style={getBorderStyle()}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle style={getTitleStyle()}>{item.name}</CardTitle>
            <CardDescription className="text-sm capitalize">
              {item.base_type || item.category}
            </CardDescription>
          </div>
          <Badge style={getBadgeStyle()}>
            {item.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {item.image_url && (
          <div className="flex justify-center mb-3">
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="h-24 object-contain"
            />
          </div>
        )}
        
        <div className="space-y-1 text-sm">
          {item.required_level > 0 && (
            <p>Required Level: {item.required_level}</p>
          )}
          
          {item.stats && item.stats.length > 0 && item.stats.map((stat, index) => (
            <p key={index} className="text-gray-300">{stat}</p>
          ))}
          
          {(!item.stats || item.stats.length === 0) && item.description && (
            <p className="text-gray-300">{item.description}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-400 pt-2">
        {item.game === "diablo2_resurrected" ? "Diablo II: Resurrected" : "Diablo IV"}
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
