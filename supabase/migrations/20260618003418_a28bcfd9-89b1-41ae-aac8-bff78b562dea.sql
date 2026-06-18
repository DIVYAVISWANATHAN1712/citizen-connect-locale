ALTER TABLE public.approval_requests
  ADD COLUMN IF NOT EXISTS proof_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS volunteer_full_name TEXT,
  ADD COLUMN IF NOT EXISTS volunteer_event_name TEXT;