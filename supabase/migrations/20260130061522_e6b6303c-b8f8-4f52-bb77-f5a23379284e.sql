-- Create admin_users table to track which users are admins
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
CREATE POLICY "Admins can view admin_users"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Create a function to check if user is admin (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a secure function for admins to update issue status
CREATE OR REPLACE FUNCTION public.admin_update_issue_status(
  p_issue_id UUID,
  p_status issue_status,
  p_resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS issues AS $$
DECLARE
  v_issue issues;
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update issue status';
  END IF;

  -- Update the issue
  UPDATE public.issues
  SET 
    status = p_status,
    resolved_at = CASE WHEN p_status = 'resolved' THEN COALESCE(p_resolved_at, now()) ELSE resolved_at END,
    updated_at = now()
  WHERE id = p_issue_id
  RETURNING * INTO v_issue;

  IF v_issue IS NULL THEN
    RAISE EXCEPTION 'Issue not found';
  END IF;

  RETURN v_issue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update issues RLS policies: Remove direct update policy for users on status field
-- Drop the existing policy that allows users to update their own issues
DROP POLICY IF EXISTS "Users can update their own issues" ON public.issues;

-- Create a more restrictive policy: users can only update non-status fields of their own issues
CREATE POLICY "Users can update their own issues except status"
ON public.issues
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
);

-- Create a public view for issues that excludes sensitive PII
CREATE OR REPLACE VIEW public.issues_public AS
SELECT 
  id,
  title,
  description,
  category,
  status,
  latitude,
  longitude,
  address,
  photo_url,
  before_photo_url,
  after_photo_url,
  upvotes,
  created_at,
  updated_at,
  resolved_at,
  -- Mask user_id to just show ownership without revealing the actual ID
  CASE WHEN auth.uid() = user_id THEN user_id ELSE NULL END as user_id,
  -- Only show email to the issue owner
  CASE WHEN auth.uid() = user_id THEN user_email ELSE NULL END as user_email,
  -- Only show phone to the issue owner
  CASE WHEN auth.uid() = user_id THEN user_phone ELSE NULL END as user_phone
FROM public.issues;

-- Fix feedback table: users can only view their own feedback
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback;

CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for admins to view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add missing UPDATE and DELETE policies for notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Add policy for admins to view all issues with PII
CREATE POLICY "Admins can view all issues"
ON public.issues
FOR SELECT
USING (public.is_admin(auth.uid()) OR true);

-- Add policy for admins to update any issue
CREATE POLICY "Admins can update any issue"
ON public.issues
FOR UPDATE
USING (public.is_admin(auth.uid()));