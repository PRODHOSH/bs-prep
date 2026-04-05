-- User-submitted PDF resources with admin approval flow

CREATE TABLE IF NOT EXISTS public.resource_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_submissions_status ON public.resource_submissions(status);
CREATE INDEX IF NOT EXISTS idx_resource_submissions_user_id ON public.resource_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_submissions_course_id ON public.resource_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_resource_submissions_created_at ON public.resource_submissions(created_at DESC);

ALTER TABLE public.resource_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own resource submissions" ON public.resource_submissions;
CREATE POLICY "Users can insert own resource submissions"
  ON public.resource_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own resource submissions" ON public.resource_submissions;
CREATE POLICY "Users can view own resource submissions"
  ON public.resource_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view approved resources" ON public.resource_submissions;
CREATE POLICY "Anyone can view approved resources"
  ON public.resource_submissions FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage all resource submissions" ON public.resource_submissions;
CREATE POLICY "Admins can manage all resource submissions"
  ON public.resource_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Keep updated_at in sync without depending on external helper functions.
CREATE OR REPLACE FUNCTION public.resource_submissions_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_resource_submissions_timestamp ON public.resource_submissions;
CREATE TRIGGER update_resource_submissions_timestamp
BEFORE UPDATE ON public.resource_submissions
FOR EACH ROW
EXECUTE FUNCTION public.resource_submissions_set_updated_at();

-- Storage bucket for uploaded PDFs (run once).
INSERT INTO storage.buckets (id, name, public)
VALUES ('resource-pdfs', 'resource-pdfs', true)
ON CONFLICT (id) DO NOTHING;
