
ALTER TABLE public.local_stalls
  ADD COLUMN IF NOT EXISTS discount_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS discount_end_date timestamptz;

ALTER TABLE public.emergency_alerts
  ADD COLUMN IF NOT EXISTS starts_at timestamptz;

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS is_self boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_type text,
  ADD COLUMN IF NOT EXISTS availability_hours text;
