import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  purpose: string | null;
  created_at: string;
  is_anonymous: boolean;
}

export interface Volunteer {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  skills: string[] | null;
  availability: string | null;
  is_active: boolean;
}

export interface LocalStall {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  phone: string | null;
  discount_info: string | null;
  discount_percentage: number | null;
  photo_url: string | null;
  is_active: boolean;
}

export interface EmergencyAlert {
  id: string;
  title_en: string;
  title_hi: string;
  message_en: string;
  message_hi: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string | null;
  description_hi: string | null;
  event_type: 'camp' | 'community_event' | 'meetup';
  location: string | null;
  start_date: string;
  end_date: string | null;
  photo_url: string | null;
  is_active: boolean;
  max_participants: number | null;
}

export function useCommunityData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stalls, setStalls] = useState<LocalStall[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVolunteerProfile, setUserVolunteerProfile] = useState<Volunteer | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [donationsRes, volunteersRes, stallsRes, alertsRes, eventsRes] = await Promise.all([
        supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('volunteers').select('*').eq('is_active', true),
        supabase.from('local_stalls').select('*').eq('is_active', true),
        supabase.from('emergency_alerts').select('*').eq('is_active', true).order('severity', { ascending: false }),
        supabase.from('community_events').select('*').eq('is_active', true).gte('start_date', new Date().toISOString()).order('start_date'),
      ]);

      if (donationsRes.data) setDonations(donationsRes.data);
      if (volunteersRes.data) setVolunteers(volunteersRes.data);
      if (stallsRes.data) setStalls(stallsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);

      // Check if current user is a volunteer
      if (user) {
        const { data: volProfile } = await supabase
          .from('volunteers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserVolunteerProfile(volProfile);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  const makeDonation = async (data: { amount: number; purpose?: string; is_anonymous?: boolean }) => {
    if (!user) {
      toast({ title: 'Please login to donate', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('donations').insert({
      user_id: user.id,
      donor_name: user.email || 'Anonymous',
      donor_email: user.email,
      amount: data.amount,
      purpose: data.purpose,
      is_anonymous: data.is_anonymous || false,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to process donation', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Thank you!', description: 'Your donation has been recorded' });
    fetchAll();
    return true;
  };

  const registerAsVolunteer = async (data: { full_name: string; phone?: string; skills?: string[]; availability?: string }) => {
    if (!user) {
      toast({ title: 'Please login to volunteer', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('volunteers').upsert({
      user_id: user.id,
      email: user.email!,
      full_name: data.full_name,
      phone: data.phone,
      skills: data.skills,
      availability: data.availability,
      is_active: true,
    }, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Error', description: 'Failed to register as volunteer', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success!', description: 'You are now registered as a volunteer' });
    fetchAll();
    return true;
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      toast({ title: 'Please login to register', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      user_id: user.id,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already registered', description: 'You are already registered for this event' });
      } else {
        toast({ title: 'Error', description: 'Failed to register for event', variant: 'destructive' });
      }
      return false;
    }

    toast({ title: 'Registered!', description: 'You are now registered for this event' });
    return true;
  };

  return {
    donations,
    volunteers,
    stalls,
    alerts,
    events,
    loading,
    userVolunteerProfile,
    makeDonation,
    registerAsVolunteer,
    registerForEvent,
    refetch: fetchAll,
  };
}
