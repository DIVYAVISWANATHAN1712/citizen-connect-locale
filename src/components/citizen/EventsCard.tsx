import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { Language } from "@/lib/i18n";
import { CommunityEvent } from "@/hooks/useCommunityData";
import { format } from "date-fns";

interface EventsCardProps {
  events: CommunityEvent[];
  language: Language;
  onRegister: (eventId: string) => Promise<boolean>;
}

const eventTypeLabels = {
  camp: { en: "Camp", hi: "शिविर", color: "bg-purple-500" },
  community_event: { en: "Event", hi: "कार्यक्रम", color: "bg-blue-500" },
  meetup: { en: "Meetup", hi: "मीटअप", color: "bg-green-500" },
};

export function EventsCard({ events, language, onRegister }: EventsCardProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {language === "hi" ? "आगामी कार्यक्रम" : "Upcoming Events"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {language === "hi" ? "कोई आगामी कार्यक्रम नहीं" : "No upcoming events"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {language === "hi" ? "आगामी कार्यक्रम" : "Upcoming Events"}
          <Badge variant="secondary">{events.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
        {events.map((event) => {
          const typeConfig = eventTypeLabels[event.event_type];
          return (
            <div
              key={event.id}
              className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {language === "hi" ? event.title_hi : event.title_en}
                    </span>
                    <Badge className={typeConfig.color}>
                      {language === "hi" ? typeConfig.hi : typeConfig.en}
                    </Badge>
                  </div>
                  {(event.description_en || event.description_hi) && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {language === "hi" ? event.description_hi : event.description_en}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.start_date), "PPP p")}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </span>
                    )}
                    {event.max_participants && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> 
                        {language === "hi" ? `अधिकतम ${event.max_participants}` : `Max ${event.max_participants}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3"
                onClick={() => onRegister(event.id)}
              >
                {language === "hi" ? "पंजीकरण करें" : "Register"}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
