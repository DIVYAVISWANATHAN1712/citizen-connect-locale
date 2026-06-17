import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, Plus, Pencil, Trash2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminVolunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  skills: string[] | null;
  availability_type: string | null;
  availability_hours: string | null;
  is_active: boolean;
  is_self: boolean;
}

export function AdminVolunteersManager() {
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<AdminVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminVolunteer | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    skills: "",
    availability_type: "weekend",
    availability_hours: "",
  });

  const reset = () => {
    setForm({ full_name: "", email: "", phone: "", skills: "", availability_type: "weekend", availability_hours: "" });
    setEditing(null);
  };

  const fetchVolunteers = async () => {
    setLoading(true);
    // Admin-managed list = is_self = false
    const { data } = await supabase
      .from("volunteers")
      .select("*")
      .eq("is_self", false)
      .order("full_name");
    setVolunteers((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { fetchVolunteers(); }, []);

  const openEdit = (v: AdminVolunteer) => {
    setEditing(v);
    setForm({
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || "",
      skills: (v.skills || []).join(", "),
      availability_type: v.availability_type || "weekend",
      availability_hours: v.availability_hours || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : null,
      availability_type: form.availability_type,
      availability_hours: form.availability_hours || null,
      is_active: true,
      is_self: false,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("volunteers").update(payload).eq("id", editing.id));
    } else {
      // For admin-added rows we don't have an auth user; generate a placeholder user_id
      ({ error } = await supabase.from("volunteers").insert({ ...payload, user_id: crypto.randomUUID() } as any));
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    setDialogOpen(false);
    reset();
    fetchVolunteers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("volunteers").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    fetchVolunteers();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Volunteers
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Volunteer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit Volunteer" : "Add Volunteer"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="First Aid, Driving" />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <RadioGroup value={form.availability_type} onValueChange={(v) => setForm({ ...form, availability_type: v })} className="flex gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="weekend" id="av-w" /><Label htmlFor="av-w" className="font-normal">Weekend</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="weekdays" id="av-wd" /><Label htmlFor="av-wd" className="font-normal">Weekdays</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="both" id="av-b" /><Label htmlFor="av-b" className="font-normal">Both</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Available Hours</Label>
                <Input value={form.availability_hours} onChange={(e) => setForm({ ...form, availability_hours: e.target.value })} placeholder="e.g., 9 AM - 1 PM" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setDialogOpen(false); reset(); }}>Cancel</Button>
                <Button type="submit" className="flex-1">{editing ? "Update" : "Add"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No volunteers added yet</div>
        ) : (
          <div className="space-y-3">
            {volunteers.map((v) => (
              <div key={v.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{v.full_name}</span>
                    {v.availability_type && <Badge variant="outline" className="capitalize">{v.availability_type}</Badge>}
                    {v.availability_hours && <Badge variant="secondary">{v.availability_hours}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{v.email}</p>
                  {v.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" /> {v.phone}</p>}
                  {v.skills && v.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {v.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
