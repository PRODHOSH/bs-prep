-- Ratings table for approved public resources

CREATE TABLE IF NOT EXISTS public.resource_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_submission_id UUID NOT NULL REFERENCES public.resource_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (resource_submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource ON public.resource_ratings(resource_submission_id);
CREATE INDEX IF NOT EXISTS idx_resource_ratings_user ON public.resource_ratings(user_id);

ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read resource ratings" ON public.resource_ratings;
CREATE POLICY "Anyone can read resource ratings"
  ON public.resource_ratings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create own resource ratings" ON public.resource_ratings;
CREATE POLICY "Users can create own resource ratings"
  ON public.resource_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resource ratings" ON public.resource_ratings;
CREATE POLICY "Users can delete own resource ratings"
  ON public.resource_ratings FOR DELETE
  USING (auth.uid() = user_id);
