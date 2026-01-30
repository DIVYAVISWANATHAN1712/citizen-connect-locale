-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('camp', 'community_event', 'meetup');

-- Create enum for alert severity
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Donations table - for citizens to contribute funds
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_anonymous BOOLEAN DEFAULT false
);

-- Volunteers table - citizens can register as volunteers
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  skills TEXT[],
  availability TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Local stalls table - businesses with discounts
CREATE TABLE public.local_stalls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  discount_info TEXT,
  discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency alerts table
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_hi TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community events (camps, events, meetups)
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  event_type event_type NOT NULL,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Donations policies
CREATE POLICY "Anyone can view non-anonymous donations"
ON public.donations FOR SELECT
USING (is_anonymous = false OR auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can donate"
ON public.donations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all donations"
ON public.donations FOR ALL
USING (is_admin(auth.uid()));

-- Volunteers policies
CREATE POLICY "Anyone can view active volunteers"
ON public.volunteers FOR SELECT
USING (is_active = true OR auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can register as volunteers"
ON public.volunteers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their volunteer profile"
ON public.volunteers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage volunteers"
ON public.volunteers FOR ALL
USING (is_admin(auth.uid()));

-- Local stalls policies
CREATE POLICY "Anyone can view active stalls"
ON public.local_stalls FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage stalls"
ON public.local_stalls FOR ALL
USING (is_admin(auth.uid()));

-- Emergency alerts policies
CREATE POLICY "Anyone can view active alerts"
ON public.emergency_alerts FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage alerts"
ON public.emergency_alerts FOR ALL
USING (is_admin(auth.uid()));

-- Community events policies
CREATE POLICY "Anyone can view active events"
ON public.community_events FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage events"
ON public.community_events FOR ALL
USING (is_admin(auth.uid()));

-- Event registrations policies
CREATE POLICY "Users can view their registrations"
ON public.event_registrations FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can register for events"
ON public.event_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registrations"
ON public.event_registrations FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage registrations"
ON public.event_registrations FOR ALL
USING (is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_volunteers_updated_at
BEFORE UPDATE ON public.volunteers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_local_stalls_updated_at
BEFORE UPDATE ON public.local_stalls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_alerts_updated_at
BEFORE UPDATE ON public.emergency_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
BEFORE UPDATE ON public.community_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();