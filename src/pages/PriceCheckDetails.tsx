
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDistanceToNow } from "date-fns";

interface PriceCheckResponse {
  id: string;
  estimated_price: number | null;
  items_offered: string | null;
  payment_type: 'currency' | 'items';
  comment: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

const PriceCheckDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [itemsOffered, setItemsOffered] = useState("");
  const [comment, setComment] = useState("");
  const [paymentType, setPaymentType] = useState<'currency' | 'items'>('currency');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: priceCheck } = useQuery({
    queryKey: ['price-check', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_checks')
        .select(`
          *,
          profiles (username)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: responses = [] } = useQuery({
    queryKey: ['price-check-responses', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_check_responses')
        .select(`
          *,
          profiles (username)
        `)
        .eq('price_check_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PriceCheckResponse[];
    },
  });

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('price_check_responses')
        .insert({
          price_check_id: id,
          user_id: user.id,
          payment_type: paymentType,
          estimated_price: paymentType === 'currency' ? parseFloat(estimatedPrice) : null,
          items_offered: paymentType === 'items' ? itemsOffered : null,
          comment,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your response has been posted!",
      });
      setEstimatedPrice("");
      setItemsOffered("");
      setComment("");
      
      // Refetch the responses after successful submission
      const { refetch } = useQuery({
        queryKey: ['price-check-responses', id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('price_check_responses')
            .select('*')
            .eq('price_check_id', id);
          if (error) throw error;
          return data;
        },
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!priceCheck) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">Loading price check details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-secondary p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{priceCheck.item_name}</h1>
                <p className="text-sm text-gray-400">
                  Posted {formatDistanceToNow(new Date(priceCheck.created_at))} ago by{" "}
                  {priceCheck.profiles?.username}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                {priceCheck.game} | {priceCheck.platform} | {priceCheck.game_mode} | {priceCheck.ladder_status}
              </div>
            </div>
            <p className="text-gray-200">{priceCheck.description}</p>
          </div>

          {user && (
            <form onSubmit={handleSubmitResponse} className="bg-secondary p-6 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold text-white">Submit Your Estimate</h2>
              
              <RadioGroup
                defaultValue="currency"
                value={paymentType}
                onValueChange={(value: 'currency' | 'items') => setPaymentType(value)}
                className="grid grid-cols-2 gap-4 mb-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="currency" id="currency" />
                  <Label htmlFor="currency">Forum Gold (FG)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="items" id="items" />
                  <Label htmlFor="items">Items</Label>
                </div>
              </RadioGroup>

              {paymentType === 'currency' ? (
                <div>
                  <Label htmlFor="estimatedPrice">Estimated Price (FG)</Label>
                  <Input
                    id="estimatedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="Enter estimated price"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="itemsOffered">Items Offered</Label>
                  <Textarea
                    id="itemsOffered"
                    value={itemsOffered}
                    onChange={(e) => setItemsOffered(e.target.value)}
                    placeholder="List the items you would trade for this..."
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any additional details..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-diablo-600 hover:bg-diablo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Response"}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Responses ({responses.length})</h2>
            {responses.map((response) => (
              <div key={response.id} className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-400">
                    {response.profiles?.username} responded{" "}
                    {formatDistanceToNow(new Date(response.created_at))} ago
                  </p>
                  <span className="px-2 py-1 bg-diablo-600 text-white text-sm rounded">
                    {response.payment_type === 'currency' 
                      ? `${response.estimated_price} FG`
                      : 'Items Offered'}
                  </span>
                </div>
                {response.payment_type === 'items' && (
                  <p className="text-gray-200 mb-2">{response.items_offered}</p>
                )}
                <p className="text-gray-200">{response.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCheckDetails;
