import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ArrowLeft, Mail, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { signIn, signUp, user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });

  // Auto-redirect based on role after login
  useEffect(() => {
    if (user && !adminLoading) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/citizen-dashboard");
      }
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: t("error", language),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.phone);
        if (error) throw error;
        toast({
          title: t("success", language),
          description: "Account created successfully! Please check your email for verification.",
        });
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        // Navigation will be handled by useEffect
      }
    } catch (error: any) {
      toast({
        title: t("error", language),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking admin status after login
  if (user && adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">
            {language === "hi" ? "रीडायरेक्ट हो रहा है..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

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

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-primary">
              {isSignUp 
                ? (language === "hi" ? "खाता बनाएं" : "Create Account")
                : (language === "hi" ? "लॉगिन करें" : "Sign In")
              }
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              {language === "hi" 
                ? "आप अपनी भूमिका के अनुसार स्वचालित रूप से रीडायरेक्ट हो जाएंगे"
                : "You'll be automatically redirected based on your role"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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

              {/* Phone (for signup) */}
              {isSignUp && (
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
              )}

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "hi" ? "पासवर्ड" : "Password"} *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={language === "hi" ? "आपका पासवर्ड दर्ज करें" : "Enter your password"}
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-white"
                disabled={isLoading}
              >
                {isLoading 
                  ? (language === "hi" ? "प्रतीक्षा करें..." : "Loading...")
                  : isSignUp 
                    ? (language === "hi" ? "खाता बनाएं" : "Create Account")
                    : (language === "hi" ? "लॉगिन करें" : "Sign In")
                }
              </Button>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp 
                    ? (language === "hi" ? "पहले से खाता है? लॉगिन करें" : "Already have an account? Sign In")
                    : (language === "hi" ? "नया खाता बनाएं" : "Create New Account")
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
