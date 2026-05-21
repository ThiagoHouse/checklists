-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS public.app_state (
  id      INTEGER PRIMARY KEY,
  data    JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce single-row (only id = 1 is allowed)
ALTER TABLE public.app_state
  ADD CONSTRAINT app_state_single_row CHECK (id = 1);

-- Seed the initial empty row so GET never returns 404
INSERT INTO public.app_state (id, data)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Disable Row Level Security so the service-role key can read/write freely.
-- If you later add auth, re-enable RLS and add appropriate policies.
ALTER TABLE public.app_state DISABLE ROW LEVEL SECURITY;
