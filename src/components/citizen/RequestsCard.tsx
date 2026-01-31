import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ClipboardCheck, FileText, Download, Plus, Calendar, Store } from "lucide-react";
import { Language } from "@/lib/i18n";
import { useApprovalRequests, ApprovalRequest } from "@/hooks/useApprovalRequests";
import { Donation } from "@/hooks/useCommunityData";
import { format } from "date-fns";

interface RequestsCardProps {
  language: Language;
  donations: Donation[];
  events: { id: string; title_en: string; title_hi: string }[];
  isVolunteer: boolean;
}

export function RequestsCard({ language, donations, events, isVolunteer }: RequestsCardProps) {
  const { 
    requests, 
    loading, 
    requestDonationCertificate, 
    requestVolunteerCertificate,
    requestEventStall,
    requestEventOrganizer 
  } = useApprovalRequests();
  
  const [stallDialogOpen, setStallDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [stallDescription, setStallDescription] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    const labels: Record<string, { en: string; hi: string }> = {
      pending: { en: "Pending", hi: "लंबित" },
      approved: { en: "Approved", hi: "स्वीकृत" },
      rejected: { en: "Rejected", hi: "अस्वीकृत" },
    };
    return (
      <Badge variant={variants[status]}>
        {language === "hi" ? labels[status]?.hi : labels[status]?.en}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; hi: string }> = {
      donation_certificate: { en: "Donation Certificate", hi: "दान प्रमाणपत्र" },
      volunteer_certificate: { en: "Volunteer Certificate", hi: "स्वयंसेवक प्रमाणपत्र" },
      event_stall: { en: "Event Stall", hi: "इवेंट स्टाल" },
      event_organizer: { en: "Event Organizer", hi: "इवेंट आयोजक" },
    };
    return language === "hi" ? labels[type]?.hi : labels[type]?.en;
  };

  const handleStallSubmit = async () => {
    if (!selectedEventId || !stallDescription) return;
    const success = await requestEventStall(selectedEventId, stallDescription);
    if (success) {
      setStallDialogOpen(false);
      setSelectedEventId("");
      setStallDescription("");
    }
  };

  const handleEventSubmit = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) return;
    const success = await requestEventOrganizer(newEvent);
    if (success) {
      setEventDialogOpen(false);
      setNewEvent({ title: "", description: "", date: "", location: "" });
    }
  };

  const generatePDF = (request: ApprovalRequest) => {
    // Create a simple certificate PDF content
    const content = `
      NagarConnect Certificate
      
      Certificate Number: ${request.certificate_number}
      Type: ${getRequestTypeLabel(request.request_type)}
      Date Issued: ${request.certificate_generated_at ? format(new Date(request.certificate_generated_at), 'PPP') : 'N/A'}
      
      This certificate is issued by NagarConnect Municipal Services.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${request.certificate_number}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get user's own donations (those they can request certificates for)
  const userDonations = donations.filter(d => !d.is_anonymous);
  const donationRequestIds = requests
    .filter(r => r.request_type === 'donation_certificate')
    .map(r => r.reference_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          {language === "hi" ? "मेरे अनुरोध" : "My Requests"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {isVolunteer && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => requestVolunteerCertificate()}
              disabled={requests.some(r => r.request_type === 'volunteer_certificate' && r.status !== 'rejected')}
            >
              <FileText className="h-4 w-4 mr-1" />
              {language === "hi" ? "स्वयंसेवक प्रमाणपत्र" : "Volunteer Certificate"}
            </Button>
          )}
          
          <Dialog open={stallDialogOpen} onOpenChange={setStallDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Store className="h-4 w-4 mr-1" />
                {language === "hi" ? "स्टाल अनुमति" : "Stall Permission"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === "hi" ? "इवेंट स्टाल के लिए अनुरोध" : "Request Event Stall"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "इवेंट चुनें" : "Select Event"}</Label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "hi" ? "इवेंट चुनें" : "Select event"} />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {language === "hi" ? event.title_hi : event.title_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "स्टाल विवरण" : "Stall Description"}</Label>
                  <Textarea
                    value={stallDescription}
                    onChange={(e) => setStallDescription(e.target.value)}
                    placeholder={language === "hi" ? "आपकी स्टाल किस बारे में होगी?" : "What will your stall be about?"}
                    rows={3}
                  />
                </div>
                <Button onClick={handleStallSubmit} className="w-full" disabled={!selectedEventId || !stallDescription}>
                  {language === "hi" ? "अनुरोध भेजें" : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                {language === "hi" ? "इवेंट आयोजित करें" : "Organize Event"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === "hi" ? "इवेंट आयोजित करने के लिए अनुरोध" : "Request to Organize Event"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "इवेंट शीर्षक" : "Event Title"} *</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder={language === "hi" ? "इवेंट का नाम" : "Event name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "विवरण" : "Description"}</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder={language === "hi" ? "इवेंट के बारे में" : "About the event"}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "hi" ? "तिथि" : "Date"} *</Label>
                    <Input
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "hi" ? "स्थान" : "Location"} *</Label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder={language === "hi" ? "स्थान" : "Location"}
                    />
                  </div>
                </div>
                <Button onClick={handleEventSubmit} className="w-full" disabled={!newEvent.title || !newEvent.date || !newEvent.location}>
                  {language === "hi" ? "अनुरोध भेजें" : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Donation Certificate Requests */}
        {userDonations.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              {language === "hi" ? "दान प्रमाणपत्र" : "Donation Certificates"}
            </p>
            <div className="space-y-2">
              {userDonations.slice(0, 3).map(donation => {
                const existingRequest = requests.find(
                  r => r.request_type === 'donation_certificate' && r.reference_id === donation.id
                );
                return (
                  <div key={donation.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span>₹{donation.amount} - {format(new Date(donation.created_at), 'PP')}</span>
                    {existingRequest ? (
                      <div className="flex items-center gap-2">
                        {getStatusBadge(existingRequest.status)}
                        {existingRequest.status === 'approved' && existingRequest.certificate_number && (
                          <Button size="sm" variant="ghost" onClick={() => generatePDF(existingRequest)}>
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => requestDonationCertificate(donation.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {language === "hi" ? "अनुरोध" : "Request"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request History */}
        {requests.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              {language === "hi" ? "अनुरोध इतिहास" : "Request History"}
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {requests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <div>
                    <span className="font-medium">{getRequestTypeLabel(request.request_type)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(request.created_at), 'PP')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.status === 'approved' && request.certificate_number && (
                      <Button size="sm" variant="ghost" onClick={() => generatePDF(request)}>
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        )}

        {!loading && requests.length === 0 && userDonations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === "hi" ? "कोई अनुरोध नहीं" : "No requests yet"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
