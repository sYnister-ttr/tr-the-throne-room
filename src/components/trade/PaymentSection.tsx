
import { PaymentType } from "@/types/trading";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentSectionProps {
  paymentType: PaymentType;
  setPaymentType: (value: PaymentType) => void;
  price: string;
  setPrice: (value: string) => void;
  paymentItems: string;
  setPaymentItems: (value: string) => void;
}

const PaymentSection = ({
  paymentType,
  setPaymentType,
  price,
  setPrice,
  paymentItems,
  setPaymentItems,
}: PaymentSectionProps) => {
  return (
    <div className="space-y-4">
      <Label>Payment Type</Label>
      <Select value={paymentType} onValueChange={(value: PaymentType) => setPaymentType(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="currency">Forum Gold</SelectItem>
          <SelectItem value="items">Items</SelectItem>
        </SelectContent>
      </Select>

      {paymentType === 'currency' ? (
        <div>
          <Label htmlFor="price">Price (FG)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price in Forum Gold"
            required
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="paymentItems">Requested Items</Label>
          <Textarea
            id="paymentItems"
            value={paymentItems}
            onChange={(e) => setPaymentItems(e.target.value)}
            placeholder="Describe the items you want in exchange..."
            required
          />
        </div>
      )}
    </div>
  );
};

export default PaymentSection;
