import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { ApprovalRequest, ApprovalStatus } from './useApprovalRequests';

export interface ApprovalRequestWithUser extends ApprovalRequest {
  user_email?: string;
  donation_amount?: number;
  volunteer_name?: string;
  event_title?: string;
}

export function useAdminApprovals() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRequests = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with additional data
      const enrichedRequests: ApprovalRequestWithUser[] = [];
      
      for (const req of data || []) {
        const enriched: ApprovalRequestWithUser = { ...req };
        
        // Get user email from auth (we'll use a workaround - store email in a lookup)
        // For now, we'll fetch donation/volunteer info which has email
        
        if (req.request_type === 'donation_certificate' && req.reference_id) {
          const { data: donation } = await supabase
            .from('donations')
            .select('amount, donor_email, donor_name')
            .eq('id', req.reference_id)
            .single();
          if (donation) {
            enriched.donation_amount = donation.amount;
            enriched.user_email = donation.donor_email || donation.donor_name;
          }
        }
        
        if (req.request_type === 'volunteer_certificate' && req.reference_id) {
          const { data: volunteer } = await supabase
            .from('volunteers')
            .select('full_name, email')
            .eq('id', req.reference_id)
            .single();
          if (volunteer) {
            enriched.volunteer_name = volunteer.full_name;
            enriched.user_email = volunteer.email;
          }
        }
        
        if (req.request_type === 'event_stall' && req.event_id) {
          const { data: event } = await supabase
            .from('community_events')
            .select('title_en')
            .eq('id', req.event_id)
            .single();
          if (event) {
            enriched.event_title = event.title_en;
          }
        }
        
        enrichedRequests.push(enriched);
      }
      
      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllRequests();
    }
  }, [isAdmin]);

  const approveRequest = async (requestId: string, adminNotes?: string) => {
    if (!user) return false;

    // First get the request to determine type
    const { data: request } = await supabase
      .from('approval_requests')
      .select('request_type')
      .eq('id', requestId)
      .single();

    if (!request) {
      toast({ title: 'Error', description: 'Request not found', variant: 'destructive' });
      return false;
    }

    // Generate certificate number
    const { data: certNum } = await supabase.rpc('generate_certificate_number', {
      request_type: request.request_type
    });

    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'approved' as ApprovalStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        certificate_number: certNum,
        certificate_generated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Approved!', description: 'Request has been approved' });
    fetchAllRequests();
    return true;
  };

  const rejectRequest = async (requestId: string, adminNotes: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected' as ApprovalStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Rejected', description: 'Request has been rejected' });
    fetchAllRequests();
    return true;
  };

  const deleteRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('approval_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Deleted', description: 'Request has been deleted' });
    fetchAllRequests();
    return true;
  };

  return {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    deleteRequest,
    refetch: fetchAllRequests,
  };
}
