import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ApprovalRequestType = 'donation_certificate' | 'volunteer_certificate' | 'event_stall' | 'event_organizer';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  user_id: string;
  request_type: ApprovalRequestType;
  status: ApprovalStatus;
  reference_id: string | null;
  event_id: string | null;
  stall_description: string | null;
  proposed_event_title: string | null;
  proposed_event_description: string | null;
  proposed_event_date: string | null;
  proposed_event_location: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  certificate_number: string | null;
  certificate_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useApprovalRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  const requestDonationCertificate = async (donationId: string) => {
    if (!user) {
      toast({ title: 'Please login', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('approval_requests').insert({
      user_id: user.id,
      request_type: 'donation_certificate' as ApprovalRequestType,
      reference_id: donationId,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already requested', description: 'You have already requested this certificate' });
      } else {
        toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
      }
      return false;
    }

    toast({ title: 'Request submitted!', description: 'Your certificate request is pending approval' });
    fetchUserRequests();
    return true;
  };

  const requestVolunteerCertificate = async () => {
    if (!user) {
      toast({ title: 'Please login', variant: 'destructive' });
      return false;
    }

    // Check if user is a volunteer
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!volunteer) {
      toast({ title: 'Not a volunteer', description: 'You must register as a volunteer first', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('approval_requests').insert({
      user_id: user.id,
      request_type: 'volunteer_certificate' as ApprovalRequestType,
      reference_id: volunteer.id,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Request submitted!', description: 'Your volunteer certificate request is pending approval' });
    fetchUserRequests();
    return true;
  };

  const requestEventStall = async (eventId: string, stallDescription: string) => {
    if (!user) {
      toast({ title: 'Please login', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('approval_requests').insert({
      user_id: user.id,
      request_type: 'event_stall' as ApprovalRequestType,
      event_id: eventId,
      stall_description: stallDescription,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Request submitted!', description: 'Your stall request is pending approval' });
    fetchUserRequests();
    return true;
  };

  const requestEventOrganizer = async (data: {
    title: string;
    description: string;
    date: string;
    location: string;
  }) => {
    if (!user) {
      toast({ title: 'Please login', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('approval_requests').insert({
      user_id: user.id,
      request_type: 'event_organizer' as ApprovalRequestType,
      proposed_event_title: data.title,
      proposed_event_description: data.description,
      proposed_event_date: data.date,
      proposed_event_location: data.location,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Request submitted!', description: 'Your event organizing request is pending approval' });
    fetchUserRequests();
    return true;
  };

  return {
    requests,
    loading,
    requestDonationCertificate,
    requestVolunteerCertificate,
    requestEventStall,
    requestEventOrganizer,
    refetch: fetchUserRequests,
  };
}
