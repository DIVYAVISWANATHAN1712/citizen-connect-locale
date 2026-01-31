import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useCommunityData } from "@/hooks/useCommunityData";
import { useIssues } from "@/hooks/useIssues";
import { 
  ArrowLeft, LogOut, AlertTriangle, Heart, Users, Store, Calendar, 
  MapPin, Clock, CheckCircle, AlertCircle, TrendingUp, Shield
} from "lucide-react";
import { DonationDialog } from "@/components/citizen/DonationDialog";
import { VolunteerDialog } from "@/components/citizen/VolunteerDialog";
import { EmergencyAlertsCard } from "@/components/citizen/EmergencyAlertsCard";
import { LocalStallsCard } from "@/components/citizen/LocalStallsCard";
import { EventsCard } from "@/components/citizen/EventsCard";
import { RequestsCard } from "@/components/citizen/RequestsCard";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const { issues, loading: issuesLoading } = useIssues();
  const { 
    donations, volunteers, stalls, alerts, events, 
    loading, makeDonation, registerAsVolunteer, registerForEvent, userVolunteerProfile 
  } = useCommunityData();
  
  const [donationOpen, setDonationOpen] = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);

  // Calculate issue statistics
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
  const pendingIssues = issues.filter(i => i.status === 'submitted' || i.status === 'acknowledged').length;
  const progressPercentage = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || issuesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "hi" ? "वापस" : "Back"}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {language === "hi" ? "नागरिक डैशबोर्ड" : "Citizen Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Emergency Alerts Banner */}
        {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">
                {language === "hi" ? "महत्वपूर्ण अलर्ट" : "Important Alerts"}
              </span>
            </div>
            <div className="mt-2 space-y-2">
              {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 2).map(alert => (
                <p key={alert.id} className="text-sm">
                  {language === "hi" ? alert.title_hi : alert.title_en}: {language === "hi" ? alert.message_hi : alert.message_en}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Issue Statistics Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === "hi" ? "समस्या प्रगति अवलोकन" : "Issue Progress Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{totalIssues}</div>
                <div className="text-sm text-muted-foreground">{t("totalIssues", language)}</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{resolvedIssues}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4" /> {t("resolved", language)}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{inProgressIssues}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" /> {t("inProgress", language)}
                </div>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{pendingIssues}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {t("pendingIssues", language)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{language === "hi" ? "समग्र प्रगति" : "Overall Progress"}</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => navigate("/report")} 
            className="h-auto py-4 flex flex-col gap-2 bg-gradient-to-r from-primary to-accent"
          >
            <MapPin className="h-6 w-6" />
            <span>{t("reportIssue", language)}</span>
          </Button>
          <Button 
            onClick={() => setDonationOpen(true)} 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
          >
            <Heart className="h-6 w-6 text-red-500" />
            <span>{t("donate", language)}</span>
          </Button>
          <Button 
            onClick={() => setVolunteerOpen(true)} 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
          >
            <Users className="h-6 w-6 text-blue-500" />
            <span>{userVolunteerProfile ? (language === "hi" ? "प्रोफ़ाइल देखें" : "View Profile") : t("volunteer", language)}</span>
          </Button>
          <Button 
            onClick={() => navigate("/my-reports")} 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
          >
            <Shield className="h-6 w-6 text-purple-500" />
            <span>{t("myReports", language)}</span>
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Emergency Alerts */}
          <EmergencyAlertsCard alerts={alerts} language={language} />

          {/* Upcoming Events */}
          <EventsCard 
            events={events} 
            language={language} 
            onRegister={registerForEvent}
          />

          {/* My Requests - Certificates & Permissions */}
          <RequestsCard 
            language={language}
            donations={donations}
            events={events.map(e => ({ id: e.id, title_en: e.title_en, title_hi: e.title_hi }))}
            isVolunteer={!!userVolunteerProfile}
          />

          {/* Local Stalls & Discounts */}
          <LocalStallsCard stalls={stalls} language={language} />

          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {language === "hi" ? "समुदाय" : "Community"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>{language === "hi" ? "सक्रिय स्वयंसेवक" : "Active Volunteers"}</span>
                </div>
                <Badge variant="secondary">{volunteers.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>{language === "hi" ? "कुल दान" : "Total Donations"}</span>
                </div>
                <Badge variant="secondary">₹{donations.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span>{language === "hi" ? "आगामी कार्यक्रम" : "Upcoming Events"}</span>
                </div>
                <Badge variant="secondary">{events.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <DonationDialog 
          open={donationOpen} 
          onOpenChange={setDonationOpen}
          onSubmit={makeDonation}
          language={language}
        />
        <VolunteerDialog 
          open={volunteerOpen} 
          onOpenChange={setVolunteerOpen}
          onSubmit={registerAsVolunteer}
          existingProfile={userVolunteerProfile}
          language={language}
        />
      </div>
    </div>
  );
}
