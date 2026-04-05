-- Add optional admin-provided short description for approved resources

ALTER TABLE IF EXISTS public.resource_submissions
  ADD COLUMN IF NOT EXISTS admin_description TEXT;
