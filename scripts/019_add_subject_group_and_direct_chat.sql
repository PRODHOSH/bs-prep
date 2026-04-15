-- Add mentor subject assignment for onboarding flow.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mentor_subject TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mentor_subjects TEXT[];

UPDATE public.profiles
SET mentor_subjects = ARRAY[mentor_subject]
WHERE mentor_subject IS NOT NULL
  AND (mentor_subjects IS NULL OR array_length(mentor_subjects, 1) IS NULL);

CREATE INDEX IF NOT EXISTS idx_profiles_mentor_subjects_gin
  ON public.profiles USING GIN (mentor_subjects);

-- Subject chat groups (one group per subject/course).
CREATE TABLE IF NOT EXISTS public.subject_chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Messages posted in subject groups.
CREATE TABLE IF NOT EXISTS public.subject_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.subject_chat_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'mentor', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct mentor-student chat thread per subject.
CREATE TABLE IF NOT EXISTS public.mentor_direct_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (mentor_id, student_id, course_id)
);

-- Messages inside a mentor-student direct thread.
CREATE TABLE IF NOT EXISTS public.mentor_direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.mentor_direct_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'mentor', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subject_chat_groups_course_id
  ON public.subject_chat_groups(course_id);

CREATE INDEX IF NOT EXISTS idx_subject_chat_messages_group_created
  ON public.subject_chat_messages(group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_direct_chats_student
  ON public.mentor_direct_chats(student_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_direct_chats_mentor
  ON public.mentor_direct_chats(mentor_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_direct_messages_chat_created
  ON public.mentor_direct_messages(chat_id, created_at DESC);

ALTER TABLE public.subject_chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_direct_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read subject groups" ON public.subject_chat_groups;
CREATE POLICY "Authenticated users can read subject groups"
  ON public.subject_chat_groups
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can read subject messages" ON public.subject_chat_messages;
CREATE POLICY "Authenticated users can read subject messages"
  ON public.subject_chat_messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own subject messages" ON public.subject_chat_messages;
CREATE POLICY "Users can insert own subject messages"
  ON public.subject_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Participants can read direct chats" ON public.mentor_direct_chats;
CREATE POLICY "Participants can read direct chats"
  ON public.mentor_direct_chats
  FOR SELECT
  USING (
    auth.uid() = mentor_id
    OR auth.uid() = student_id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Participants can insert direct chats" ON public.mentor_direct_chats;
CREATE POLICY "Participants can insert direct chats"
  ON public.mentor_direct_chats
  FOR INSERT
  WITH CHECK (
    auth.uid() = mentor_id
    OR auth.uid() = student_id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Participants can read direct messages" ON public.mentor_direct_messages;
CREATE POLICY "Participants can read direct messages"
  ON public.mentor_direct_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.mentor_direct_chats chats
      WHERE chats.id = mentor_direct_messages.chat_id
        AND (
          chats.mentor_id = auth.uid()
          OR chats.student_id = auth.uid()
          OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    )
  );

DROP POLICY IF EXISTS "Participants can insert direct messages" ON public.mentor_direct_messages;
CREATE POLICY "Participants can insert direct messages"
  ON public.mentor_direct_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM public.mentor_direct_chats chats
      WHERE chats.id = mentor_direct_messages.chat_id
        AND (
          chats.mentor_id = auth.uid()
          OR chats.student_id = auth.uid()
          OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    )
  );

-- Seed the three subject groups used in the app.
INSERT INTO public.subject_chat_groups (course_id, name)
VALUES
  ('qualifier-math-1', 'Mathematics 1 Community'),
  ('qualifier-stats-1', 'Statistics 1 Community'),
  ('qualifier-computational-thinking', 'Computational Thinking Community')
ON CONFLICT (course_id) DO UPDATE
SET
  name = EXCLUDED.name,
  updated_at = NOW();
