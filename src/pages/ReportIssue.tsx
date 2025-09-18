import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIssues } from "@/hooks/useIssues";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Camera, Mic, MapPin, ArrowLeft, Mail, Phone } from "lucide-react";
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
  const { user } = useAuth();
  const { createIssue } = useIssues();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    photo: null as File | null,
    location: "Getting location...",
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setFormData(prev => ({ 
            ...prev, 
            location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}` 
          }));
        },
        () => {
          setFormData(prev => ({ ...prev, location: "Location not available" }));
        }
      );
    }
  }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description || !formData.email) {
      toast({
        title: t("error", language),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
        user_email: formData.email,
        user_phone: formData.phone,
        priority: 'medium', // Default priority
      });
      
      toast({
        title: t("success", language),
        description: "Your issue has been submitted successfully",
      });
      
      navigate("/my-reports");
    } catch (error: any) {
      toast({
        title: t("error", language),
        description: error.message || "Failed to submit issue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              {/* User Contact Info */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-sm">
                  {language === "hi" ? "संपर्क जानकारी" : "Contact Information"}
                </h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {language === "hi" ? "ईमेल पता" : "Email Address"} *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={language === "hi" ? "आपका ईमेल दर्ज करें" : "Enter your email"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {language === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={language === "hi" ? "आपका मोबाइल नंबर दर्ज करें" : "Enter your mobile number"}
                  />
                </div>
              </div>

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

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "hi" ? "समस्या का शीर्षक" : "Issue Title"} *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === "hi" ? "संक्षेप में समस्या बताएं" : "Brief title for the issue"}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("description", language)} *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === "hi" ? "समस्या का विस्तृत विवरण दें..." : "Provide detailed description of the issue..."}
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