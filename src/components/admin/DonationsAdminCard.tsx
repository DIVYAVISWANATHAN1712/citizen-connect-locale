import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Donation {
  id: string;
  donor_name: string;
  donor_email?: string | null;
  amount: number;
  purpose: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export function DonationsAdminCard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
      setDonations((data || []) as any);
      setLoading(false);
    })();
  }, []);

  const total = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const donorCount = new Set(donations.map(d => d.donor_email || d.donor_name)).size;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" /> Donations Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">₹{total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Raised</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{donations.length}</div>
            <div className="text-xs text-muted-foreground">Donations</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{donorCount}</div>
            <div className="text-xs text-muted-foreground">Unique Donors</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" /></div>
        ) : donations.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No donations yet</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {donations.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {d.is_anonymous ? "Anonymous" : (d.donor_name || d.donor_email)}
                    {d.is_anonymous && <Badge variant="outline" className="ml-2 text-xs">Anonymous</Badge>}
                  </div>
                  {d.purpose && <div className="text-xs text-muted-foreground">{d.purpose}</div>}
                  <div className="text-xs text-muted-foreground">{format(new Date(d.created_at), "PPp")}</div>
                </div>
                <div className="font-bold text-lg">₹{Number(d.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
