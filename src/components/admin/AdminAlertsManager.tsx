import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { Language } from "@/lib/i18n";
import { EmergencyAlert } from "@/hooks/useAdminData";
import { format } from "date-fns";

interface AdminAlertsManagerProps {
  alerts: EmergencyAlert[];
  loading: boolean;
  onCreate: (data: Partial<EmergencyAlert>) => Promise<boolean>;
  onUpdate: (id: string, data: Partial<EmergencyAlert>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  language: Language;
}

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export function AdminAlertsManager({ alerts, loading, onCreate, onUpdate, onDelete }: AdminAlertsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<EmergencyAlert | null>(null);
  const [formData, setFormData] = useState({
    title_en: "",
    message_en: "",
    severity: "medium" as 'low' | 'medium' | 'high' | 'critical',
    starts_at: "",
    expires_at: "",
  });

  const resetForm = () => {
    setFormData({ title_en: "", message_en: "", severity: "medium", starts_at: "", expires_at: "" });
    setEditingAlert(null);
  };

  const openEditDialog = (alert: any) => {
    setEditingAlert(alert);
    setFormData({
      title_en: alert.title_en,
      message_en: alert.message_en,
      severity: alert.severity,
      starts_at: alert.starts_at ? new Date(alert.starts_at).toISOString().slice(0, 16) : "",
      expires_at: alert.expires_at ? new Date(alert.expires_at).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      title_en: formData.title_en,
      title_hi: formData.title_en,
      message_en: formData.message_en,
      message_hi: formData.message_en,
      severity: formData.severity,
      starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      is_active: true,
    };

    const success = editingAlert
      ? await onUpdate(editingAlert.id, data)
      : await onCreate(data);

    if (success) { setDialogOpen(false); resetForm(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Emergency Alerts Management
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Alert</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAlert ? "Edit Alert" : "Create New Alert"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Message <span className="text-destructive">*</span></Label>
                <Textarea value={formData.message_en} onChange={(e) => setFormData({ ...formData, message_en: e.target.value })} rows={3} required />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="datetime-local" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">{editingAlert ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No alerts found</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div key={alert.id} className={`p-4 border rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{alert.title_en}</span>
                      <Badge className={severityColors[alert.severity as keyof typeof severityColors]}>{alert.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message_en}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      {alert.starts_at && <span>Starts: {format(new Date(alert.starts_at), "PPp")}</span>}
                      {alert.expires_at && <span>Ends: {format(new Date(alert.expires_at), "PPp")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(alert)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(alert.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
