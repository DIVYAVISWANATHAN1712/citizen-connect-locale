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
import { Store, Plus, Pencil, Trash2, MapPin, Phone, Percent } from "lucide-react";
import { Language } from "@/lib/i18n";
import { LocalStall } from "@/hooks/useAdminData";

interface AdminStallsManagerProps {
  stalls: LocalStall[];
  loading: boolean;
  onCreate: (data: Partial<LocalStall>) => Promise<boolean>;
  onUpdate: (id: string, data: Partial<LocalStall>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  language: Language;
}

export function AdminStallsManager({ stalls, loading, onCreate, onUpdate, onDelete, language }: AdminStallsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStall, setEditingStall] = useState<LocalStall | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    address: "",
    phone: "",
    discount_info: "",
    discount_percentage: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      address: "",
      phone: "",
      discount_info: "",
      discount_percentage: "",
      is_active: true,
    });
    setEditingStall(null);
  };

  const openEditDialog = (stall: LocalStall) => {
    setEditingStall(stall);
    setFormData({
      name: stall.name,
      description: stall.description || "",
      category: stall.category,
      address: stall.address || "",
      phone: stall.phone || "",
      discount_info: stall.discount_info || "",
      discount_percentage: stall.discount_percentage?.toString() || "",
      is_active: stall.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      address: formData.address || null,
      phone: formData.phone || null,
      discount_info: formData.discount_info || null,
      discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
      is_active: formData.is_active,
    };

    let success: boolean;
    if (editingStall) {
      success = await onUpdate(editingStall.id, data);
    } else {
      success = await onCreate(data);
    }

    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const categories = ["Grocery", "Restaurant", "Pharmacy", "Electronics", "Clothing", "Services", "Other"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {language === "hi" ? "स्थानीय दुकानें प्रबंधन" : "Local Stalls Management"}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              {language === "hi" ? "नई दुकान" : "Add Stall"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStall 
                  ? (language === "hi" ? "दुकान संपादित करें" : "Edit Stall")
                  : (language === "hi" ? "नई दुकान जोड़ें" : "Add New Stall")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{language === "hi" ? "नाम" : "Name"} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "hi" ? "श्रेणी" : "Category"} *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">{language === "hi" ? "श्रेणी चुनें" : "Select category"}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{language === "hi" ? "विवरण" : "Description"}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "पता" : "Address"}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "फ़ोन" : "Phone"}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "छूट %" : "Discount %"}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "छूट जानकारी" : "Discount Info"}</Label>
                  <Input
                    value={formData.discount_info}
                    onChange={(e) => setFormData({ ...formData, discount_info: e.target.value })}
                    placeholder="e.g., Buy 2 Get 1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>{language === "hi" ? "सक्रिय" : "Active"}</Label>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1">
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
                <Button type="submit" className="flex-1">
                  {editingStall ? (language === "hi" ? "अपडेट करें" : "Update") : (language === "hi" ? "जोड़ें" : "Add")}
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
        ) : stalls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === "hi" ? "कोई दुकान नहीं मिली" : "No stalls found"}
          </div>
        ) : (
          <div className="space-y-3">
            {stalls.map((stall) => (
              <div key={stall.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{stall.name}</span>
                    <Badge variant="secondary">{stall.category}</Badge>
                    {!stall.is_active && (
                      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                    )}
                    {stall.discount_percentage && (
                      <Badge className="bg-green-500">
                        <Percent className="h-3 w-3 mr-1" />
                        {stall.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>
                  {stall.description && (
                    <p className="text-sm text-muted-foreground mt-1">{stall.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {stall.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {stall.address}
                      </span>
                    )}
                    {stall.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {stall.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditDialog(stall)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(stall.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
