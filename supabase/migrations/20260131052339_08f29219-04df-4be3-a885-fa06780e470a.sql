-- Create enum for approval request types
CREATE TYPE public.approval_request_type AS ENUM ('donation_certificate', 'volunteer_certificate', 'event_stall', 'event_organizer');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create approval requests table
CREATE TABLE public.approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type public.approval_request_type NOT NULL,
  status public.approval_status NOT NULL DEFAULT 'pending',
  
  -- For certificates: reference to donation or volunteer record
  reference_id UUID,
  
  -- For event stall requests
  event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
  stall_description TEXT,
  
  -- For event organizer requests
  proposed_event_title TEXT,
  proposed_event_description TEXT,
  proposed_event_date TIMESTAMP WITH TIME ZONE,
  proposed_event_location TEXT,
  
  -- Admin response
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Certificate details (populated on approval)
  certificate_number TEXT,
  certificate_generated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_approval_requests_user ON public.approval_requests(user_id);
CREATE INDEX idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX idx_approval_requests_type ON public.approval_requests(request_type);

-- Enable RLS
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.approval_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create their own requests"
ON public.approval_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.approval_requests
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update any request
CREATE POLICY "Admins can update any request"
ON public.approval_requests
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Admins can delete any request
CREATE POLICY "Admins can delete any request"
ON public.approval_requests
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_approval_requests_updated_at
BEFORE UPDATE ON public.approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number(request_type approval_request_type)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  seq_num INT;
BEGIN
  -- Get prefix based on type
  CASE request_type
    WHEN 'donation_certificate' THEN prefix := 'DON';
    WHEN 'volunteer_certificate' THEN prefix := 'VOL';
    WHEN 'event_stall' THEN prefix := 'STL';
    WHEN 'event_organizer' THEN prefix := 'ORG';
    ELSE prefix := 'REQ';
  END CASE;
  
  -- Get next sequence number for this type
  SELECT COUNT(*) + 1 INTO seq_num 
  FROM public.approval_requests 
  WHERE approval_requests.request_type = generate_certificate_number.request_type 
    AND certificate_number IS NOT NULL;
  
  RETURN prefix || '-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(seq_num::TEXT, 5, '0');
END;
$$;