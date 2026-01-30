import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

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

export function useAdminData() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [stalls, setStalls] = useState<LocalStall[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [stallsRes, alertsRes, eventsRes] = await Promise.all([
        supabase.from('local_stalls').select('*').order('created_at', { ascending: false }),
        supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('community_events').select('*').order('start_date', { ascending: false }),
      ]);

      if (stallsRes.data) setStalls(stallsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAll();
    }
  }, [isAdmin]);

  // Stall management
  const createStall = async (data: Partial<LocalStall>) => {
    const { error } = await supabase.from('local_stalls').insert(data as any);
    if (error) {
      toast({ title: 'Error', description: 'Failed to create stall', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Stall created' });
    fetchAll();
    return true;
  };

  const updateStall = async (id: string, data: Partial<LocalStall>) => {
    const { error } = await supabase.from('local_stalls').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update stall', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Stall updated' });
    fetchAll();
    return true;
  };

  const deleteStall = async (id: string) => {
    const { error } = await supabase.from('local_stalls').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete stall', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Stall deleted' });
    fetchAll();
    return true;
  };

  // Alert management
  const createAlert = async (data: Partial<EmergencyAlert>) => {
    if (!user) return false;
    const { error } = await supabase.from('emergency_alerts').insert({
      ...data,
      created_by: user.id,
    } as any);
    if (error) {
      toast({ title: 'Error', description: 'Failed to create alert', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Alert created' });
    fetchAll();
    return true;
  };

  const updateAlert = async (id: string, data: Partial<EmergencyAlert>) => {
    const { error } = await supabase.from('emergency_alerts').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update alert', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Alert updated' });
    fetchAll();
    return true;
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from('emergency_alerts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete alert', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Alert deleted' });
    fetchAll();
    return true;
  };

  // Event management
  const createEvent = async (data: Partial<CommunityEvent>) => {
    if (!user) return false;
    const { error } = await supabase.from('community_events').insert({
      ...data,
      created_by: user.id,
    } as any);
    if (error) {
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Event created' });
    fetchAll();
    return true;
  };

  const updateEvent = async (id: string, data: Partial<CommunityEvent>) => {
    const { error } = await supabase.from('community_events').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update event', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Event updated' });
    fetchAll();
    return true;
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('community_events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Event deleted' });
    fetchAll();
    return true;
  };

  return {
    stalls,
    alerts,
    events,
    loading,
    // Stalls
    createStall,
    updateStall,
    deleteStall,
    // Alerts
    createAlert,
    updateAlert,
    deleteAlert,
    // Events
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchAll,
  };
}
