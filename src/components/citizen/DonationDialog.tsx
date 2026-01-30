import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { Language } from "@/lib/i18n";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { amount: number; purpose?: string; is_anonymous?: boolean }) => Promise<boolean>;
  language: Language;
}

export function DonationDialog({ open, onOpenChange, onSubmit, language }: DonationDialogProps) {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    const success = await onSubmit({
      amount: Number(amount),
      purpose: purpose || undefined,
      is_anonymous: isAnonymous,
    });
    setIsLoading(false);

    if (success) {
      setAmount("");
      setPurpose("");
      setIsAnonymous(false);
      onOpenChange(false);
    }
  };

  const presetAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {language === "hi" ? "दान करें" : "Make a Donation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "hi" ? "राशि (₹)" : "Amount (₹)"}</Label>
            <div className="flex gap-2 flex-wrap">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === String(preset) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(String(preset))}
                >
                  ₹{preset}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={language === "hi" ? "कस्टम राशि दर्ज करें" : "Enter custom amount"}
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "उद्देश्य (वैकल्पिक)" : "Purpose (Optional)"}</Label>
            <Textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={language === "hi" ? "आप किस उद्देश्य के लिए दान कर रहे हैं?" : "What are you donating for?"}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              {language === "hi" ? "इस दान को गुमनाम रखें" : "Make this donation anonymous"}
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500"
              disabled={isLoading || !amount}
            >
              {isLoading 
                ? (language === "hi" ? "प्रोसेसिंग..." : "Processing...") 
                : (language === "hi" ? "दान करें" : "Donate")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
