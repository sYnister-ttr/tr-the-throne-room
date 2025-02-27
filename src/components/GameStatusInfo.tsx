
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TerrorZone {
  id: string;
  created_at: string;
  zone_name: string;
  server: string;
  expires_at: string;
}

interface DcloneStatus {
  id: string;
  created_at: string;
  region: string;
  status: number;
  progress: string;
  updated_at: string;
}

const GameStatusInfo = () => {
  const [terrorZones, setTerrorZones] = useState<TerrorZone[]>([]);
  const [dcloneStatus, setDcloneStatus] = useState<DcloneStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch terror zones
      const { data: tzData, error: tzError } = await supabase
        .from("terror_zones")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (tzError) throw tzError;
      setTerrorZones(tzData || []);

      // Fetch dclone status
      const { data: dcData, error: dcError } = await supabase
        .from("dclone_status")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(3);

      if (dcError) throw dcError;
      setDcloneStatus(dcData || []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching game status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup real-time subscription for updates
    const terrorZoneChannel = supabase
      .channel("terror-zones-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "terror_zones" },
        (payload) => {
          setTerrorZones((current) => [payload.new as TerrorZone, ...current.slice(0, 4)]);
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    const dcloneChannel = supabase
      .channel("dclone-status-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dclone_status" },
        (payload) => {
          setDcloneStatus((current) => [payload.new as DcloneStatus, ...current.slice(0, 2)]);
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(terrorZoneChannel);
      supabase.removeChannel(dcloneChannel);
    };
  }, []);

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expireTime = new Date(expiresAt);
    const diff = expireTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDcloneStatusColor = (status: number) => {
    if (status <= 2) return "bg-gray-500 text-white";
    if (status <= 4) return "bg-blue-500 text-white";
    if (status <= 5) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-diablo-500 drop-shadow-[0_0_10px_rgba(255,61,61,0.3)] uppercase tracking-wider">
          Game Status Info
        </h2>
        <button 
          onClick={fetchData} 
          className="flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-200"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Updating..." : "Refresh"}</span>
        </button>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      <Card className="bg-black/60 border-diablo-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-diablo-400">Terror Zones</CardTitle>
        </CardHeader>
        <CardContent>
          {terrorZones.length > 0 ? (
            <div className="space-y-3">
              {terrorZones.map((zone) => (
                <div key={zone.id} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{zone.zone_name}</div>
                    <Badge variant="outline" className="bg-diablo-900/50">
                      {zone.server}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Updated: {formatTimestamp(zone.created_at)}</span>
                    <span>Remaining: {getTimeRemaining(zone.expires_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-2">No active terror zones</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-diablo-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-diablo-400">Diablo Clone Status</CardTitle>
        </CardHeader>
        <CardContent>
          {dcloneStatus.length > 0 ? (
            <div className="space-y-3">
              {dcloneStatus.map((status) => (
                <div key={status.id} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{status.region}</div>
                    <Badge className={getDcloneStatusColor(status.status)}>
                      {status.status}/6 - {status.progress}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Updated: {formatTimestamp(status.updated_at || status.created_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-2">No dclone status available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStatusInfo;
