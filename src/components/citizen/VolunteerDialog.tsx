import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, X } from "lucide-react";
import { Language } from "@/lib/i18n";
import { Volunteer } from "@/hooks/useCommunityData";

interface VolunteerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { full_name: string; phone?: string; skills?: string[]; availability_type?: string; availability_hours?: string }) => Promise<boolean>;
  existingProfile: Volunteer | null;
  language: Language;
}

export function VolunteerDialog({ open, onOpenChange, onSubmit, existingProfile, language }: VolunteerDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [availabilityType, setAvailabilityType] = useState<string>("weekend");
  const [availabilityHours, setAvailabilityHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.full_name);
      setPhone(existingProfile.phone || "");
      setSkills(existingProfile.skills || []);
      setAvailabilityType(existingProfile.availability_type || "weekend");
      setAvailabilityHours(existingProfile.availability_hours || "");
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
      availability_type: availabilityType,
      availability_hours: availabilityHours || undefined,
    });
    setIsLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const suggestedSkills = ["First Aid", "Driving", "Computer", "Teaching", "Cooking"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            {existingProfile ? "Volunteer Profile" : "Become a Volunteer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name <span className="text-destructive">*</span></Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>+</Button>
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
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Availability <span className="text-destructive">*</span></Label>
            <RadioGroup value={availabilityType} onValueChange={setAvailabilityType} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekend" id="av-weekend" />
                <Label htmlFor="av-weekend" className="font-normal cursor-pointer">Weekend</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekdays" id="av-weekdays" />
                <Label htmlFor="av-weekdays" className="font-normal cursor-pointer">Weekdays</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="av-both" />
                <Label htmlFor="av-both" className="font-normal cursor-pointer">Both</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Available Hours</Label>
            <Input
              value={availabilityHours}
              onChange={(e) => setAvailabilityHours(e.target.value)}
              placeholder="e.g., 9 AM - 1 PM"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
              disabled={isLoading || !fullName.trim()}
            >
              {isLoading ? "Saving..." : existingProfile ? "Update" : "Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
