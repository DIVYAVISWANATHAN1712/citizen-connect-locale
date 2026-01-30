import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIssues, Issue } from "@/hooks/useIssues";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { RealTimeStats } from "@/components/RealTimeStats";
import { IssueMap } from "@/components/IssueMap";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MapPin, Calendar, RefreshCw, ShieldAlert, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { issues, loading, updateIssueStatus, refetch } = useIssues();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Show loading state while checking auth and admin status
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <LogIn className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'hi' ? 'लॉगिन आवश्यक' : 'Login Required'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'hi' 
                ? 'इस पेज को एक्सेस करने के लिए कृपया लॉगिन करें।' 
                : 'Please login to access this page.'}
            </p>
            <Button onClick={() => navigate('/auth')}>
              {language === 'hi' ? 'लॉगिन करें' : 'Go to Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'hi' ? 'पहुंच अस्वीकृत' : 'Access Denied'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'hi' 
                ? 'इस पेज को एक्सेस करने के लिए आपको एडमिन अधिकारों की आवश्यकता है।' 
                : 'You need administrator privileges to access this page.'}
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              {language === 'hi' ? 'होम पर जाएं' : 'Go to Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusUpdate = async (issueId: string, newStatus: Issue['status']) => {
    try {
      await updateIssueStatus(issueId, newStatus, language);
      toast({
        title: language === 'hi' ? 'स्थिति अपडेट की गई' : 'Status Updated',
        description: language === 'hi' 
          ? 'समस्या की स्थिति सफलतापूर्वक अपडेट की गई। नागरिक को ईमेल भेजा गया।' 
          : 'Issue status has been updated. Email notification sent to citizen.',
      });
    } catch (error) {
      toast({
        title: t("error", language),
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setActiveTab("issues");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">
              {t("dashboard", language)} - {language === 'hi' ? 'स्टाफ पोर्टल' : 'Staff Portal'}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {language === 'hi' ? 'रीफ्रेश' : 'Refresh'}
              </Button>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {language === 'hi' ? 'अवलोकन' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="issues">
              {language === 'hi' ? 'समस्याएं' : 'Issues'} ({issues.length})
            </TabsTrigger>
            <TabsTrigger value="map">
              {language === 'hi' ? 'मानचित्र' : 'Map View'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Stats */}
            <RealTimeStats language={language} />

            {/* Recent Issues from Database */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{language === 'hi' ? 'हाल की समस्याएं' : 'Recent Issues'}</CardTitle>
                <Badge variant="outline">{language === 'hi' ? 'लाइव' : 'Live'}</Badge>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : issues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'hi' ? 'कोई समस्या नहीं मिली' : 'No issues found'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {issue.address || `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(issue.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{t(issue.category, language)}</Badge>
                          <StatusBadge status={issue.status} language={language} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {language === 'hi' ? 'सभी समस्याएं' : 'All Issues'}
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : issues.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  {language === 'hi' ? 'कोई समस्या नहीं मिली' : 'No issues found'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <Card key={issue.id} className={selectedIssue?.id === issue.id ? 'ring-2 ring-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-medium">{issue.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {issue.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'hi' ? 'द्वारा रिपोर्ट किया गया' : 'Reported by'} {issue.user_email} • {new Date(issue.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={issue.status} language={language} />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {issue.address || `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}`}
                        </span>
                        <Badge variant="outline">{t(issue.category, language)}</Badge>
                        {issue.upvotes && issue.upvotes > 0 && (
                          <Badge variant="secondary">{issue.upvotes} {language === 'hi' ? 'वोट' : 'upvotes'}</Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4 items-center">
                        <Select
                          value={issue.status}
                          onValueChange={(value) => handleStatusUpdate(issue.id, value as Issue['status'])}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">
                              {language === 'hi' ? 'सबमिट किया गया' : 'Submitted'}
                            </SelectItem>
                            <SelectItem value="acknowledged">
                              {language === 'hi' ? 'स्वीकार किया गया' : 'Acknowledged'}
                            </SelectItem>
                            <SelectItem value="in_progress">
                              {language === 'hi' ? 'प्रगति में' : 'In Progress'}
                            </SelectItem>
                            <SelectItem value="resolved">
                              {language === 'hi' ? 'हल किया गया' : 'Resolved'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {issue.photo_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={issue.photo_url} target="_blank" rel="noopener noreferrer">
                              {language === 'hi' ? 'फोटो देखें' : 'View Photo'}
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {language === 'hi' ? 'समस्याओं का मानचित्र' : 'Issue Map'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IssueMap 
                  issues={issues} 
                  language={language} 
                  onIssueClick={handleIssueClick}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
