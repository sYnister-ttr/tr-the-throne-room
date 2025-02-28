
import { Runeword } from "@/types/items";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RunewordCardProps {
  runeword: Runeword;
}

const RunewordCard = ({ runeword }: RunewordCardProps) => {
  return (
    <Card className="border border-amber-600 hover:shadow-md hover:shadow-amber-600/20 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-amber-500">{runeword.name}</CardTitle>
            <div className="flex flex-wrap gap-1 mt-1">
              {runeword.runes.map((rune, index) => (
                <Badge 
                  key={index} 
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {rune}
                </Badge>
              ))}
            </div>
          </div>
          <Badge className="bg-blue-600 hover:bg-blue-700">
            Runeword
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="text-sm text-gray-400 mt-2">
          <span>Required Level: {runeword.required_level}</span>
          <span className="mx-2">•</span>
          <span>Valid Bases: {runeword.base_types.join(', ')}</span>
        </div>
        
        <div className="space-y-1 text-sm">
          <h4 className="font-semibold text-amber-400 mt-3">Variable Stats:</h4>
          {Object.entries(runeword.variable_stats).map(([stat, values]) => (
            <p key={stat} className="text-amber-200">
              {formatStatName(stat)}: {values.min}-{values.max}
            </p>
          ))}
          
          <h4 className="font-semibold text-white mt-3">Fixed Stats:</h4>
          {runeword.fixed_stats.map((stat, index) => (
            <p key={index} className="text-gray-300">{stat}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const formatStatName = (stat: string): string => {
  return stat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default RunewordCard;
