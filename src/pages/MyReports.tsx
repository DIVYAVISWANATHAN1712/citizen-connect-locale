import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIssues } from "@/hooks/useIssues";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ArrowLeft, MapPin, Calendar, ThumbsUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MyReports() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { issues, loading, upvoteIssue, fetchUserIssues } = useIssues();
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUserIssues();
  }, [user, navigate, fetchUserIssues]);

  const handleUpvote = async (issueId: string) => {
    try {
      await upvoteIssue(issueId);
      toast({
        title: language === "hi" ? "वोट दिया गया" : "Upvoted",
        description: language === "hi" ? "इस समस्या को आपका समर्थन मिला" : "Your support has been recorded",
      });
    } catch (error) {
      toast({
        title: t("error", language),
        description: "Failed to upvote issue",
        variant: "destructive",
      });
    }
  };

  const submitFeedback = async () => {
    // This would submit feedback to Supabase
    toast({
      title: t("success", language),
      description: language === "hi" ? "फीडबैक भेजा गया" : "Feedback submitted",
    });
    setSelectedIssue(null);
    setFeedback({ rating: 0, comment: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

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
          {issues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {language === "hi" ? "कोई रिपोर्ट नहीं मिली" : "No reports found"}
                </p>
                <Button 
                  onClick={() => navigate("/report")} 
                  className="mt-4"
                >
                  {t("reportIssue", language)}
                </Button>
              </CardContent>
            </Card>
          ) : (
            issues.map((issue) => (
              <Card key={issue.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{issue.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {issue.description}
                        </p>
                      </div>
                      <StatusBadge status={issue.status} language={language} />
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{issue.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {t(issue.category as any, language)}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-7 px-2 text-xs"
                          onClick={() => handleUpvote(issue.id)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          {issue.upvotes}
                        </Button>
                        {issue.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-7 px-2 text-xs"
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <Star className="h-3 w-3" />
                            {language === "hi" ? "रेट करें" : "Rate"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}