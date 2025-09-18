import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface Stats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  todayIssues: number;
}

interface RealTimeStatsProps {
  language: "en" | "hi";
}

export function RealTimeStats({ language }: RealTimeStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    todayIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get total issues
      const { count: totalIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true });

      // Get pending issues (submitted, acknowledged, inProgress)
      const { count: pendingIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .in('status', ['submitted', 'acknowledged', 'inProgress']);

      // Get resolved issues
      const { count: resolvedIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      // Get today's issues
      const today = new Date().toISOString().split('T')[0];
      const { count: todayIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalIssues: totalIssues || 0,
        pendingIssues: pendingIssues || 0,
        resolvedIssues: resolvedIssues || 0,
        todayIssues: todayIssues || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for stats
    const subscription = supabase
      .channel('stats_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' }, 
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {language === "hi" ? "कुल समस्याएं" : "Total Issues"}
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIssues}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.todayIssues} {language === "hi" ? "आज" : "today"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {language === "hi" ? "लंबित समस्याएं" : "Pending Issues"}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.pendingIssues}</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "तत्काल ध्यान चाहिए" : "Requires attention"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {language === "hi" ? "हल की गई समस्याएं" : "Resolved Issues"}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.resolvedIssues}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalIssues > 0 
              ? `${((stats.resolvedIssues / stats.totalIssues) * 100).toFixed(1)}% ${language === "hi" ? "समाधान दर" : "resolution rate"}`
              : "0% resolution rate"
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {language === "hi" ? "आज की रिपोर्ट्स" : "Today's Reports"}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayIssues}</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "नई समस्याएं" : "New issues reported"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}