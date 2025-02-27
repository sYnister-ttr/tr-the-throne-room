
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>("unique_weapons");
  const [limit, setLimit] = useState<number>(50);
  const [importResults, setImportResults] = useState<any>(null);

  // Fetch current item count for stats
  const { data: itemStats } = useQuery({
    queryKey: ["itemStats"],
    queryFn: async () => {
      const { data: total, error: totalError } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true });
      
      const { data: d2Items, error: d2Error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('game', 'diablo2_resurrected');
        
      const { data: d4Items, error: d4Error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('game', 'diablo4');
      
      if (totalError || d2Error || d4Error) {
        toast({
          variant: "destructive",
          title: "Error fetching statistics",
          description: totalError?.message || d2Error?.message || d4Error?.message,
        });
        return null;
      }
      
      return {
        total: total?.count || 0,
        d2Count: d2Items?.count || 0,
        d4Count: d4Items?.count || 0,
      };
    },
  });

  const importItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/import-d2-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          limit: Number(limit),
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to import items");
      }
      
      setImportResults(result);
      toast({
        title: "Import Successful",
        description: `Imported ${result.imported} items from ${category}`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-diablo-500 mb-6 drop-shadow-[0_0_10px_rgba(255,61,61,0.3)] uppercase tracking-wider">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Item Database Stats</CardTitle>
              <CardDescription>Current item counts in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-bold">{itemStats?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diablo 2 Items:</span>
                  <span className="font-bold">{itemStats?.d2Count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diablo 4 Items:</span>
                  <span className="font-bold">{itemStats?.d4Count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Import Tool Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Import Items</CardTitle>
              <CardDescription>Import items from Diablo 2 wiki sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    Category to Import
                  </label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unique_weapons">Unique Weapons</SelectItem>
                      <SelectItem value="unique_armor">Unique Armor</SelectItem>
                      <SelectItem value="set_items">Set Items</SelectItem>
                      <SelectItem value="runes">Runes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="limit" className="block text-sm font-medium">
                    Item Limit
                  </label>
                  <Input
                    id="limit"
                    type="number"
                    min="1"
                    max="500"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of items to import at once. Higher values may take longer.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={importItems} 
                disabled={isLoading}
                className="w-full bg-diablo-600 hover:bg-diablo-700"
              >
                {isLoading ? "Importing..." : "Import Items"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Import Results Card */}
          {importResults && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  Successfully imported {importResults.imported} items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {importResults.items.map((item: string, index: number) => (
                    <div key={index} className="text-sm py-1 border-b border-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
