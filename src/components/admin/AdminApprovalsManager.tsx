import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Check, X, Eye, FileText, Calendar, Store, Users } from "lucide-react";
import { Language } from "@/lib/i18n";
import { useAdminApprovals, ApprovalRequestWithUser } from "@/hooks/useAdminApprovals";
import { format } from "date-fns";

interface AdminApprovalsManagerProps {
  language: Language;
}

export function AdminApprovalsManager({ language }: AdminApprovalsManagerProps) {
  const { requests, loading, approveRequest, rejectRequest, deleteRequest } = useAdminApprovals();
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestWithUser | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; hi: string }> = {
      donation_certificate: { en: "Donation Certificate", hi: "दान प्रमाणपत्र" },
      volunteer_certificate: { en: "Volunteer Certificate", hi: "स्वयंसेवक प्रमाणपत्र" },
      event_stall: { en: "Event Stall Permission", hi: "इवेंट स्टाल अनुमति" },
      event_organizer: { en: "Event Organizer Permission", hi: "इवेंट आयोजक अनुमति" },
    };
    return language === "hi" ? labels[type]?.hi : labels[type]?.en;
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation_certificate': return <FileText className="h-4 w-4 text-green-500" />;
      case 'volunteer_certificate': return <Users className="h-4 w-4 text-blue-500" />;
      case 'event_stall': return <Store className="h-4 w-4 text-purple-500" />;
      case 'event_organizer': return <Calendar className="h-4 w-4 text-orange-500" />;
      default: return <ClipboardCheck className="h-4 w-4" />;
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    if (actionType === 'approve') {
      await approveRequest(selectedRequest.id, adminNotes);
    } else {
      await rejectRequest(selectedRequest.id, adminNotes);
    }
    
    setSelectedRequest(null);
    setAdminNotes("");
    setActionType(null);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const RequestCard = ({ request }: { request: ApprovalRequestWithUser }) => (
    <div className="p-4 border rounded-lg flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {getTypeIcon(request.request_type)}
          <span className="font-semibold">{getRequestTypeLabel(request.request_type)}</span>
          {getStatusBadge(request.status)}
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          {request.user_email && (
            <p>{language === "hi" ? "उपयोगकर्ता" : "User"}: {request.user_email}</p>
          )}
          {request.donation_amount && (
            <p>{language === "hi" ? "दान राशि" : "Donation Amount"}: ₹{request.donation_amount}</p>
          )}
          {request.volunteer_name && (
            <p>{language === "hi" ? "स्वयंसेवक" : "Volunteer"}: {request.volunteer_name}</p>
          )}
          {request.event_title && (
            <p>{language === "hi" ? "इवेंट" : "Event"}: {request.event_title}</p>
          )}
          {request.stall_description && (
            <p>{language === "hi" ? "स्टाल विवरण" : "Stall Description"}: {request.stall_description}</p>
          )}
          {request.proposed_event_title && (
            <>
              <p><strong>{language === "hi" ? "प्रस्तावित इवेंट" : "Proposed Event"}:</strong> {request.proposed_event_title}</p>
              {request.proposed_event_description && <p>{request.proposed_event_description}</p>}
              {request.proposed_event_date && (
                <p>{language === "hi" ? "तिथि" : "Date"}: {format(new Date(request.proposed_event_date), 'PPP')}</p>
              )}
              {request.proposed_event_location && (
                <p>{language === "hi" ? "स्थान" : "Location"}: {request.proposed_event_location}</p>
              )}
            </>
          )}
          {request.certificate_number && (
            <p className="text-green-600 font-medium">
              {language === "hi" ? "प्रमाणपत्र संख्या" : "Certificate #"}: {request.certificate_number}
            </p>
          )}
          <p className="text-xs">
            {language === "hi" ? "अनुरोध किया गया" : "Requested"}: {format(new Date(request.created_at), 'PPp')}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {request.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-600"
              onClick={() => {
                setSelectedRequest(request);
                setActionType('approve');
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-destructive"
              onClick={() => {
                setSelectedRequest(request);
                setActionType('reject');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => setSelectedRequest(request)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            {language === "hi" ? "अनुमोदन अनुरोध" : "Approval Requests"}
            {pendingRequests.length > 0 && (
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                {language === "hi" ? "लंबित" : "Pending"} ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="processed">
                {language === "hi" ? "संसाधित" : "Processed"} ({processedRequests.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === "hi" ? "कोई लंबित अनुरोध नहीं" : "No pending requests"}
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="processed">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : processedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === "hi" ? "कोई संसाधित अनुरोध नहीं" : "No processed requests"}
                </div>
              ) : (
                <div className="space-y-3">
                  {processedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionType && !!selectedRequest} onOpenChange={() => { setActionType(null); setAdminNotes(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' 
                ? (language === "hi" ? "अनुरोध स्वीकृत करें" : "Approve Request")
                : (language === "hi" ? "अनुरोध अस्वीकृत करें" : "Reject Request")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {language === "hi" ? "व्यवस्थापक टिप्पणियाँ (वैकल्पिक)" : "Admin Notes (optional)"}
              </p>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={language === "hi" ? "कोई टिप्पणी जोड़ें..." : "Add any notes..."}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setActionType(null); setAdminNotes(""); }} className="flex-1">
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </Button>
              <Button 
                onClick={handleAction}
                className={`flex-1 ${actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
              >
                {actionType === 'approve' 
                  ? (language === "hi" ? "स्वीकृत करें" : "Approve")
                  : (language === "hi" ? "अस्वीकृत करें" : "Reject")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedRequest && !actionType} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "hi" ? "अनुरोध विवरण" : "Request Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedRequest.request_type)}
                <span className="font-semibold">{getRequestTypeLabel(selectedRequest.request_type)}</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                {selectedRequest.user_email && <p><strong>User:</strong> {selectedRequest.user_email}</p>}
                {selectedRequest.donation_amount && <p><strong>Amount:</strong> ₹{selectedRequest.donation_amount}</p>}
                {selectedRequest.volunteer_name && <p><strong>Volunteer:</strong> {selectedRequest.volunteer_name}</p>}
                {selectedRequest.event_title && <p><strong>Event:</strong> {selectedRequest.event_title}</p>}
                {selectedRequest.stall_description && <p><strong>Stall:</strong> {selectedRequest.stall_description}</p>}
                {selectedRequest.proposed_event_title && (
                  <>
                    <p><strong>Proposed Event:</strong> {selectedRequest.proposed_event_title}</p>
                    {selectedRequest.proposed_event_description && <p>{selectedRequest.proposed_event_description}</p>}
                    {selectedRequest.proposed_event_date && (
                      <p><strong>Date:</strong> {format(new Date(selectedRequest.proposed_event_date), 'PPP')}</p>
                    )}
                    {selectedRequest.proposed_event_location && (
                      <p><strong>Location:</strong> {selectedRequest.proposed_event_location}</p>
                    )}
                  </>
                )}
                {selectedRequest.certificate_number && (
                  <p className="text-green-600"><strong>Certificate #:</strong> {selectedRequest.certificate_number}</p>
                )}
                {selectedRequest.admin_notes && (
                  <p><strong>Admin Notes:</strong> {selectedRequest.admin_notes}</p>
                )}
                <p><strong>Requested:</strong> {format(new Date(selectedRequest.created_at), 'PPp')}</p>
                {selectedRequest.reviewed_at && (
                  <p><strong>Reviewed:</strong> {format(new Date(selectedRequest.reviewed_at), 'PPp')}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
