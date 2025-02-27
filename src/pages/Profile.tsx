
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserTrades from "@/components/UserTrades";
import PriceCheckList from "@/components/PriceCheckList";
import UserProfileCard from "@/components/UserProfileCard";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile for user ID:", user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        
        if (data) {
          console.log("Profile data:", data);
          setUsername(data.username);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      console.log("Updating username for user ID:", user.id);
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Username updated successfully!",
      });
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">You need to be logged in to view this page</h2>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {profileLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading profile information...</p>
            </div>
          ) : (
            <>
              <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                <form onSubmit={handleUpdateUsername} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-diablo-600 hover:bg-diablo-700"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Username"}
                  </Button>
                </form>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Your Listings</h2>
                <UserTrades userId={user.id} />
              </div>

              <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Your Price Checks</h2>
                <PriceCheckList userId={user.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
