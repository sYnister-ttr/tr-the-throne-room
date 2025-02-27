
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { GameType } from "@/types/items";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface VariableStat {
  name: string;
  min: number;
  max: number;
}

const AddRuneword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [game, setGame] = useState<GameType>("diablo2_resurrected");
  const [runes, setRunes] = useState("");
  const [baseTypes, setBaseTypes] = useState("");
  const [requiredLevel, setRequiredLevel] = useState(1);
  const [variableStats, setVariableStats] = useState<VariableStat[]>([
    { name: "", min: 0, max: 0 }
  ]);
  const [fixedStats, setFixedStats] = useState("");

  const handleAddVariableStat = () => {
    setVariableStats([...variableStats, { name: "", min: 0, max: 0 }]);
  };

  const handleRemoveVariableStat = (index: number) => {
    setVariableStats(variableStats.filter((_, i) => i !== index));
  };

  const handleVariableStatChange = (index: number, field: keyof VariableStat, value: string | number) => {
    const newStats = [...variableStats];
    newStats[index] = {
      ...newStats[index],
      [field]: value
    };
    setVariableStats(newStats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert variableStats array to object for DB storage
      const variableStatsObject: Record<string, { min: number; max: number }> = {};
      variableStats.forEach(stat => {
        if (stat.name) {
          variableStatsObject[stat.name] = {
            min: stat.min,
            max: stat.max
          };
        }
      });

      const { error } = await supabase.from("runewords").insert({
        name,
        game,
        runes: runes.split(',').map(rune => rune.trim()),
        base_types: baseTypes.split(',').map(type => type.trim()),
        required_level: requiredLevel,
        variable_stats: variableStatsObject,
        fixed_stats: fixedStats.split('\n').filter(stat => stat.trim() !== '')
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Runeword has been added to the database!",
      });
      navigate("/runewords");
    } catch (error: any) {
      console.error("Error adding runeword:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Add New Runeword</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Runeword Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter runeword name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="game">Game</Label>
              <Select
                value={game}
                onValueChange={(value) => setGame(value as GameType)}
              >
                <SelectTrigger id="game">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diablo2_resurrected">Diablo II: Resurrected</SelectItem>
                  <SelectItem value="diablo4">Diablo IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="runes">Runes (comma separated)</Label>
              <Input
                id="runes"
                value={runes}
                onChange={(e) => setRunes(e.target.value)}
                placeholder="e.g., Jah, Ith, Ber"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="baseTypes">Base Types (comma separated)</Label>
              <Input
                id="baseTypes"
                value={baseTypes}
                onChange={(e) => setBaseTypes(e.target.value)}
                placeholder="e.g., Body Armor, Shield"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="requiredLevel">Required Level</Label>
              <Input
                id="requiredLevel"
                type="number"
                value={requiredLevel}
                onChange={(e) => setRequiredLevel(parseInt(e.target.value))}
                required
                min={1}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Variable Stats</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddVariableStat}
                >
                  Add Stat
                </Button>
              </div>
              
              {variableStats.map((stat, index) => (
                <Card key={index} className="bg-secondary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3">
                        <Label htmlFor={`stat-name-${index}`}>Stat Name</Label>
                        <Input
                          id={`stat-name-${index}`}
                          value={stat.name}
                          onChange={(e) => handleVariableStatChange(index, "name", e.target.value)}
                          placeholder="e.g., defense, damage"
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`stat-min-${index}`}>Min Value</Label>
                        <Input
                          id={`stat-min-${index}`}
                          type="number"
                          value={stat.min}
                          onChange={(e) => handleVariableStatChange(index, "min", parseInt(e.target.value))}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`stat-max-${index}`}>Max Value</Label>
                        <Input
                          id={`stat-max-${index}`}
                          type="number"
                          value={stat.max}
                          onChange={(e) => handleVariableStatChange(index, "max", parseInt(e.target.value))}
                          className="bg-background"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveVariableStat(index)}
                          disabled={variableStats.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div>
              <Label htmlFor="fixedStats">Fixed Stats (one per line)</Label>
              <Textarea
                id="fixedStats"
                value={fixedStats}
                onChange={(e) => setFixedStats(e.target.value)}
                placeholder="+2 To All Skills&#10;+40% Faster Cast Rate&#10;..."
                rows={6}
                required
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/runewords")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-diablo-600 hover:bg-diablo-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Runeword"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRuneword;
