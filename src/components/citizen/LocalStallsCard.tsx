import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Phone, Percent } from "lucide-react";
import { Language } from "@/lib/i18n";
import { LocalStall } from "@/hooks/useCommunityData";

interface LocalStallsCardProps {
  stalls: LocalStall[];
  language: Language;
}

export function LocalStallsCard({ stalls, language }: LocalStallsCardProps) {
  if (stalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {language === "hi" ? "स्थानीय दुकानें और छूट" : "Local Stalls & Discounts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {language === "hi" ? "कोई दुकान उपलब्ध नहीं" : "No stalls available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {language === "hi" ? "स्थानीय दुकानें और छूट" : "Local Stalls & Discounts"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
        {stalls.map((stall) => (
          <div
            key={stall.id}
            className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stall.name}</span>
                  <Badge variant="secondary" className="text-xs">{stall.category}</Badge>
                </div>
                {stall.description && (
                  <p className="text-sm text-muted-foreground mt-1">{stall.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {stall.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {stall.address}
                    </span>
                  )}
                  {stall.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {stall.phone}
                    </span>
                  )}
                </div>
              </div>
              {(stall.discount_percentage || stall.discount_info) && (
                <div className="flex flex-col items-end gap-1">
                  {stall.discount_percentage && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Percent className="h-3 w-3 mr-1" />
                      {stall.discount_percentage}% OFF
                    </Badge>
                  )}
                  {stall.discount_info && (
                    <span className="text-xs text-green-600">{stall.discount_info}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
