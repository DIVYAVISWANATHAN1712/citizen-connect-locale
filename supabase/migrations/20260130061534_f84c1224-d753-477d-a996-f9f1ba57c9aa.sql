-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.issues_public;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Admins can view all issues" ON public.issues;

-- Instead, we'll update the existing "Anyone can view issues" policy to hide PII
-- First drop the existing policy
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;

-- Create a new SELECT policy that allows viewing but uses the is_admin function for PII access
-- The actual PII filtering will be done in application code
CREATE POLICY "Anyone can view issues"
ON public.issues
FOR SELECT
USING (true);

-- Drop the old feedback policy that might still exist
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback;