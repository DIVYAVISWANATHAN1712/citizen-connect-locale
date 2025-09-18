import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";

const mockReports = [
  {
    id: 1,
    category: "roads",
    description: "Large pothole on Main Street causing traffic issues",
    status: "inProgress" as const,
    location: "Main Street, Sector 15",
    date: "2024-01-15",
    photo: "/placeholder.svg",
  },
  {
    id: 2,
    category: "streetlights",
    description: "Street light not working for past 3 days",
    status: "acknowledged" as const,
    location: "Park Avenue, Sector 12",
    date: "2024-01-14",
    photo: "/placeholder.svg",
  },
  {
    id: 3,
    category: "waste",
    description: "Garbage overflow near community center",
    status: "resolved" as const,
    location: "Community Center, Sector 8",
    date: "2024-01-10",
    photo: "/placeholder.svg",
  },
];

export default function MyReports() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "hi" ? "वापस" : "Back"}
          </Button>
          <LanguageToggle />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">
            {t("myReports", language)}
          </h1>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {mockReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={report.photo}
                    alt="Issue"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {report.description}
                      </h3>
                      <StatusBadge status={report.status} language={language} />
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-primary font-medium">
                      {t(report.category as any, language)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}