-- Bootstrap mentor_requests if it was not created by earlier migrations.
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  subject TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mentor_requests_student_id
  ON public.mentor_requests(student_id);

CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentor_id
  ON public.mentor_requests(mentor_id);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mentor requests" ON public.mentor_requests;
CREATE POLICY "Users can view their own mentor requests"
  ON public.mentor_requests
  FOR SELECT
  USING (
    student_id = auth.uid()
    OR mentor_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Students can create mentor requests" ON public.mentor_requests;
CREATE POLICY "Students can create mentor requests"
  ON public.mentor_requests
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update mentor requests" ON public.mentor_requests;
CREATE POLICY "Mentors can update mentor requests"
  ON public.mentor_requests
  FOR UPDATE
  USING (
    mentor_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create mentor request messages table for mentor-student chat threads.
CREATE TABLE IF NOT EXISTS public.mentor_request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_request_id UUID NOT NULL REFERENCES public.mentor_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'mentor')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mentor_request_messages_request_created_at
  ON public.mentor_request_messages(mentor_request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_request_messages_sender
  ON public.mentor_request_messages(sender_id);

ALTER TABLE public.mentor_request_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read mentor request messages" ON public.mentor_request_messages;
CREATE POLICY "Participants can read mentor request messages"
  ON public.mentor_request_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.mentor_requests mr
      WHERE mr.id = mentor_request_messages.mentor_request_id
        AND (
          mr.student_id = auth.uid()
          OR mr.mentor_id = auth.uid()
          OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    )
  );

DROP POLICY IF EXISTS "Participants can insert mentor request messages" ON public.mentor_request_messages;
CREATE POLICY "Participants can insert mentor request messages"
  ON public.mentor_request_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.mentor_requests mr
      WHERE mr.id = mentor_request_messages.mentor_request_id
        AND (
          (mr.student_id = auth.uid() AND sender_role = 'student')
          OR (mr.mentor_id = auth.uid() AND sender_role = 'mentor')
          OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    )
  );
