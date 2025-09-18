import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MapPin, FileText, Settings, Users, LogOut, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAuthAction = () => {
    if (user) {
      navigate("/my-reports");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <div className="p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary">NagarConnect</h1>
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "नागरिक सेवा मंच" : "Civic Service Platform"}
            </p>
            {user && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === "hi" ? "स्वागत है" : "Welcome"}, {user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {user && (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <MapPin className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === "hi" 
              ? "अपने शहर की समस्याओं को रिपोर्ट करें" 
              : "Report Your City's Issues"}
          </h2>
          <p className="text-muted-foreground">
            {language === "hi"
              ? "सड़क, बिजली, पानी और अन्य समस्याओं को आसानी से रिपोर्ट करें"
              : "Easily report road, electricity, water and other issues"}
          </p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-4 space-y-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Report Issue */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Button
                onClick={() => navigate("/report")}
                className="w-full h-20 bg-gradient-to-r from-primary to-accent text-white rounded-none justify-start gap-4 text-left"
                variant="ghost"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {t("reportIssue", language)}
                  </div>
                  <div className="text-white/80 text-sm">
                    {language === "hi" ? "नई समस्या दर्ज करें" : "Submit a new issue"}
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* My Reports / Login */}
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={handleAuthAction}
                variant="ghost"
                className="w-full justify-start gap-4 h-16"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  {user ? (
                    <FileText className="h-5 w-5 text-secondary-foreground" />
                  ) : (
                    <User className="h-5 w-5 text-secondary-foreground" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium">
                    {user 
                      ? t("myReports", language)
                      : (language === "hi" ? "लॉगिन करें" : "Sign In")
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user 
                      ? (language === "hi" ? "अपनी रिपोर्ट्स देखें" : "View your submitted reports")
                      : (language === "hi" ? "खाता बनाएं या लॉगिन करें" : "Create account or sign in")
                    }
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={() => navigate("/admin")}
                variant="ghost"
                className="w-full justify-start gap-4 h-16"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Staff Portal</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "hi" ? "प्रशासनिक डैशबोर्ड" : "Administrative dashboard"}
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        {language === "hi" 
          ? "एक बेहतर शहर के लिए मिलकर काम करते हैं" 
          : "Working together for a better city"}
      </div>
    </div>
  );
};

export default Index;
