-- Add level/type-based categorization for resources and make course_id optional

ALTER TABLE IF EXISTS public.resource_submissions
  ADD COLUMN IF NOT EXISTS level TEXT,
  ADD COLUMN IF NOT EXISTS resource_type TEXT;

-- Backfill for old rows
DO $$
BEGIN
  IF to_regclass('public.resource_submissions') IS NOT NULL THEN
    UPDATE public.resource_submissions
    SET level = COALESCE(level, 'foundation')
    WHERE level IS NULL;

    UPDATE public.resource_submissions
    SET resource_type = COALESCE(resource_type, 'course-material')
    WHERE resource_type IS NULL;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.resource_submissions
  ALTER COLUMN level SET NOT NULL,
  ALTER COLUMN resource_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'resource_submissions_level_check'
  ) THEN
    ALTER TABLE public.resource_submissions
      ADD CONSTRAINT resource_submissions_level_check
      CHECK (level IN ('foundation', 'diploma', 'degree', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'resource_submissions_type_check'
  ) THEN
    ALTER TABLE public.resource_submissions
      ADD CONSTRAINT resource_submissions_type_check
      CHECK (resource_type IN ('course-material', 'activity', 'notes', 'assignment', 'other'));
  END IF;
END $$;

-- Optional for new flow: not all resources need course linkage
ALTER TABLE IF EXISTS public.resource_submissions
  ALTER COLUMN course_id DROP NOT NULL;
