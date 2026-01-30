import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Pencil, Trash2, MapPin, Users, Clock } from "lucide-react";
import { Language } from "@/lib/i18n";
import { CommunityEvent } from "@/hooks/useAdminData";
import { format } from "date-fns";

interface AdminEventsManagerProps {
  events: CommunityEvent[];
  loading: boolean;
  onCreate: (data: Partial<CommunityEvent>) => Promise<boolean>;
  onUpdate: (id: string, data: Partial<CommunityEvent>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  language: Language;
}

const eventTypeConfig = {
  camp: { en: "Camp", hi: "शिविर", color: "bg-purple-500" },
  community_event: { en: "Community Event", hi: "सामुदायिक कार्यक्रम", color: "bg-blue-500" },
  meetup: { en: "Meetup", hi: "मीटअप", color: "bg-green-500" },
};

export function AdminEventsManager({ events, loading, onCreate, onUpdate, onDelete, language }: AdminEventsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [formData, setFormData] = useState({
    title_en: "",
    title_hi: "",
    description_en: "",
    description_hi: "",
    event_type: "community_event" as 'camp' | 'community_event' | 'meetup',
    location: "",
    start_date: "",
    end_date: "",
    max_participants: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title_en: "",
      title_hi: "",
      description_en: "",
      description_hi: "",
      event_type: "community_event",
      location: "",
      start_date: "",
      end_date: "",
      max_participants: "",
      is_active: true,
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: CommunityEvent) => {
    setEditingEvent(event);
    setFormData({
      title_en: event.title_en,
      title_hi: event.title_hi,
      description_en: event.description_en || "",
      description_hi: event.description_hi || "",
      event_type: event.event_type,
      location: event.location || "",
      start_date: new Date(event.start_date).toISOString().slice(0, 16),
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
      max_participants: event.max_participants?.toString() || "",
      is_active: event.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title_en: formData.title_en,
      title_hi: formData.title_hi,
      description_en: formData.description_en || null,
      description_hi: formData.description_hi || null,
      event_type: formData.event_type,
      location: formData.location || null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      is_active: formData.is_active,
    };

    let success: boolean;
    if (editingEvent) {
      success = await onUpdate(editingEvent.id, data);
    } else {
      success = await onCreate(data);
    }

    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {language === "hi" ? "शिविर और कार्यक्रम प्रबंधन" : "Camps & Events Management"}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              {language === "hi" ? "नया कार्यक्रम" : "Add Event"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEvent 
                  ? (language === "hi" ? "कार्यक्रम संपादित करें" : "Edit Event")
                  : (language === "hi" ? "नया कार्यक्रम बनाएं" : "Create New Event")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>{language === "hi" ? "प्रकार" : "Event Type"} *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camp">Camp / शिविर</SelectItem>
                    <SelectItem value="community_event">Community Event / सामुदायिक कार्यक्रम</SelectItem>
                    <SelectItem value="meetup">Meetup / मीटअप</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (English) *</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>शीर्षक (हिंदी) *</Label>
                  <Input
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>विवरण (हिंदी)</Label>
                  <Textarea
                    value={formData.description_hi}
                    onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "hi" ? "स्थान" : "Location"}</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter venue address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "आरंभ" : "Start Date"} *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "समाप्ति" : "End Date"}</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "अधिकतम प्रतिभागी" : "Max Participants"}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{language === "hi" ? "सक्रिय" : "Active"}</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1">
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
                <Button type="submit" className="flex-1">
                  {editingEvent ? (language === "hi" ? "अपडेट करें" : "Update") : (language === "hi" ? "बनाएं" : "Create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === "hi" ? "कोई कार्यक्रम नहीं मिला" : "No events found"}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const config = eventTypeConfig[event.event_type];
              return (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {language === "hi" ? event.title_hi : event.title_en}
                        </span>
                        <Badge className={config.color}>
                          {language === "hi" ? config.hi : config.en}
                        </Badge>
                        {!event.is_active && (
                          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        )}
                      </div>
                      {(event.description_en || event.description_hi) && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {language === "hi" ? event.description_hi : event.description_en}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
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
                            <Users className="h-3 w-3" /> Max {event.max_participants}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
