import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, X } from "lucide-react";
import { Language } from "@/lib/i18n";
import { Volunteer } from "@/hooks/useCommunityData";

interface VolunteerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { full_name: string; phone?: string; skills?: string[]; availability?: string }) => Promise<boolean>;
  existingProfile: Volunteer | null;
  language: Language;
}

export function VolunteerDialog({ open, onOpenChange, onSubmit, existingProfile, language }: VolunteerDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.full_name);
      setPhone(existingProfile.phone || "");
      setSkills(existingProfile.skills || []);
      setAvailability(existingProfile.availability || "");
    }
  }, [existingProfile]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsLoading(true);
    const success = await onSubmit({
      full_name: fullName,
      phone: phone || undefined,
      skills: skills.length > 0 ? skills : undefined,
      availability: availability || undefined,
    });
    setIsLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const suggestedSkills = [
    language === "hi" ? "प्राथमिक चिकित्सा" : "First Aid",
    language === "hi" ? "ड्राइविंग" : "Driving",
    language === "hi" ? "कंप्यूटर" : "Computer",
    language === "hi" ? "शिक्षण" : "Teaching",
    language === "hi" ? "खाना बनाना" : "Cooking",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            {existingProfile 
              ? (language === "hi" ? "स्वयंसेवक प्रोफ़ाइल" : "Volunteer Profile")
              : (language === "hi" ? "स्वयंसेवक बनें" : "Become a Volunteer")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "hi" ? "पूरा नाम" : "Full Name"} *</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={language === "hi" ? "आपका पूरा नाम" : "Your full name"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "फ़ोन नंबर" : "Phone Number"}</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={language === "hi" ? "आपका फ़ोन नंबर" : "Your phone number"}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "कौशल" : "Skills"}</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder={language === "hi" ? "कौशल जोड़ें" : "Add a skill"}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                +
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => !skills.includes(skill) && setSkills([...skills, skill])}
                >
                  + {skill}
                </Badge>
              ))}
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "उपलब्धता" : "Availability"}</Label>
            <Textarea
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder={language === "hi" ? "आप कब उपलब्ध हैं? (जैसे: सप्ताहांत, शाम)" : "When are you available? (e.g., Weekends, Evenings)"}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
              disabled={isLoading || !fullName.trim()}
            >
              {isLoading 
                ? (language === "hi" ? "सेव हो रहा है..." : "Saving...") 
                : existingProfile 
                  ? (language === "hi" ? "अपडेट करें" : "Update")
                  : (language === "hi" ? "पंजीकरण करें" : "Register")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
