-- Add is_public column to allow doubts to be shown on the public SEO pages
ALTER TABLE public.doubts ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Add a slug column for SEO-friendly URLs (e.g., bsprep.in/doubts/how-to-calculate-gpa)
ALTER TABLE public.doubts ADD COLUMN slug TEXT UNIQUE;

-- Create an index on is_public and slug to make the public listing page and sitemap queries blazing fast
CREATE INDEX idx_doubts_is_public ON public.doubts(is_public);
CREATE INDEX idx_doubts_slug ON public.doubts(slug);

-- (Optional) If you have existing doubts you want to test with, you can manually set one to public in the Supabase Dashboard, and give it a slug like 'test-public-doubt'.
