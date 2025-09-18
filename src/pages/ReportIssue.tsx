import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Camera, Mic, MapPin, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "waste", key: "waste" as const },
  { id: "roads", key: "roads" as const },
  { id: "streetlights", key: "streetlights" as const },
  { id: "water", key: "water" as const },
  { id: "other", key: "other" as const },
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    photo: null as File | null,
    location: "Current Location",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description) {
      toast({
        title: t("error", language),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: t("success", language),
      description: "Your issue has been submitted successfully",
    });
    
    setIsSubmitting(false);
    navigate("/");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

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

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-primary">
              {t("reportIssue", language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("category", language)} *
                </label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={`${t("category", language)}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {t(cat.key, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("description", language)} *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === "hi" ? "समस्या का विवरण दें..." : "Describe the issue..."}
                  className="min-h-[100px]"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("photo", language)}
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    {formData.photo ? formData.photo.name : (language === "hi" ? "फोटो अपलोड करें" : "Upload Photo")}
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Voice Note */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
              >
                <Mic className="h-4 w-4" />
                {t("voiceNote", language)}
              </Button>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("location", language)}
                </label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm">{formData.location}</span>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("loading", language) : t("submit", language)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}