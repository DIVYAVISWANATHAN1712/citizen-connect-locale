import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Language } from "@/lib/i18n";
import { EmergencyAlert } from "@/hooks/useCommunityData";

interface EmergencyAlertsCardProps {
  alerts: EmergencyAlert[];
  language: Language;
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: "bg-red-500", textColor: "text-red-500" },
  high: { icon: AlertTriangle, color: "bg-orange-500", textColor: "text-orange-500" },
  medium: { icon: AlertCircle, color: "bg-yellow-500", textColor: "text-yellow-500" },
  low: { icon: Info, color: "bg-blue-500", textColor: "text-blue-500" },
};

export function EmergencyAlertsCard({ alerts, language }: EmergencyAlertsCardProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {language === "hi" ? "आपातकालीन अलर्ट" : "Emergency Alerts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {language === "hi" ? "कोई सक्रिय अलर्ट नहीं" : "No active alerts"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {language === "hi" ? "आपातकालीन अलर्ट" : "Emergency Alerts"}
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-500/5' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-500/5' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/5' :
                'border-blue-500 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`h-5 w-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {language === "hi" ? alert.title_hi : alert.title_en}
                    </span>
                    <Badge variant="outline" className={`text-xs ${config.textColor}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "hi" ? alert.message_hi : alert.message_en}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
