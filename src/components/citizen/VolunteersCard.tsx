import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Phone, UserPlus, CheckCircle2 } from "lucide-react";
import { Volunteer } from "@/hooks/useCommunityData";

interface VolunteersCardProps {
  volunteers: Volunteer[];
  onRegisterClick: () => void;
  isRegistered: boolean;
}

export function VolunteersCard({ volunteers, onRegisterClick, isRegistered }: VolunteersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Volunteers
          <Badge variant="secondary">{volunteers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onRegisterClick}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
          variant={isRegistered ? "outline" : "default"}
        >
          {isRegistered ? (
            <><CheckCircle2 className="h-4 w-4 mr-2" /> View / Update My Volunteer Profile</>
          ) : (
            <><UserPlus className="h-4 w-4 mr-2" /> Register as Volunteer</>
          )}
        </Button>

        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">Active Volunteers</p>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {volunteers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active volunteers yet
              </p>
            ) : (
              volunteers.map((v) => (
                <div key={v.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-medium">{v.full_name}</span>
                    {v.availability_type && (
                      <Badge variant="outline" className="text-xs capitalize">{v.availability_type}</Badge>
                    )}
                  </div>
                  {v.skills && v.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {v.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {v.phone && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {v.phone}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
