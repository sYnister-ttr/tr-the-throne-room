
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
  return (
    <Card className={`border border-${getRarityColor(item.rarity)} hover:shadow-md hover:shadow-${getRarityColor(item.rarity)}/20 transition-all`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`text-${getRarityColor(item.rarity)}`}>{item.name}</CardTitle>
            <CardDescription className="text-sm capitalize">
              {item.base_type || item.category}
            </CardDescription>
          </div>
          <Badge className={`bg-${getCategoryColor(item.category)} hover:bg-${getCategoryColor(item.category)}`}>
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
          
          {item.stats && item.stats.map((stat, index) => (
            <p key={index} className="text-gray-300">{stat}</p>
          ))}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-400 pt-2">
        {item.game === "diablo2_resurrected" ? "Diablo II: Resurrected" : "Diablo IV"}
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
