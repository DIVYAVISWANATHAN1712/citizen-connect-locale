import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MapPin, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

const mockStats = {
  totalIssues: 156,
  pendingIssues: 42,
  resolvedIssues: 98,
  averageResolutionTime: "3.2 days",
};

const mockIssues = [
  {
    id: 1,
    category: "roads",
    description: "Large pothole on Main Street causing traffic issues",
    status: "inProgress" as const,
    location: "Main Street, Sector 15",
    priority: "high",
    assignedTo: "Roads Dept.",
    reportedBy: "Citizen #1234",
    date: "2024-01-15",
  },
  {
    id: 2,
    category: "streetlights",
    description: "Street light not working for past 3 days",
    status: "acknowledged" as const,
    location: "Park Avenue, Sector 12",
    priority: "medium",
    assignedTo: "Electrical Dept.",
    reportedBy: "Citizen #5678",
    date: "2024-01-14",
  },
  {
    id: 3,
    category: "waste",
    description: "Garbage overflow near community center",
    status: "submitted" as const,
    location: "Community Center, Sector 8",
    priority: "high",
    assignedTo: "Unassigned",
    reportedBy: "Citizen #9012",
    date: "2024-01-13",
  },
];

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">
              {t("dashboard", language)} - Staff Portal
            </h1>
            <LanguageToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("totalIssues", language)}
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalIssues}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("pendingIssues", language)}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {mockStats.pendingIssues}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("resolvedIssues", language)}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {mockStats.resolvedIssues}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    62.8% resolution rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("averageResolutionTime", language)}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.averageResolutionTime}</div>
                  <p className="text-xs text-muted-foreground">
                    -0.5 days vs last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockIssues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{issue.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {issue.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {issue.assignedTo}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={issue.priority === "high" ? "destructive" : "secondary"}>
                          {issue.priority}
                        </Badge>
                        <StatusBadge status={issue.status} language={language} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Issues</h2>
              <Button>Filter & Sort</Button>
            </div>
            
            <div className="space-y-4">
              {mockIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h3 className="font-medium">{issue.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          Reported by {issue.reportedBy} on {issue.date}
                        </p>
                      </div>
                      <StatusBadge status={issue.status} language={language} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {issue.location}
                      </span>
                      <Badge variant="outline">{t(issue.category as any, language)}</Badge>
                      <Badge variant={issue.priority === "high" ? "destructive" : "secondary"}>
                        {issue.priority} priority
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Assign</Button>
                      <Button size="sm" variant="outline">Update Status</Button>
                      <Button size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <div className="bg-muted rounded-lg p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
              <p className="text-muted-foreground mb-4">
                Map integration will show all reported issues with location pins
              </p>
              <Button>Set up Mapbox Integration</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}