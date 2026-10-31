-- Quiz prep: history, per-question stats, OPPE progress and study activity.
--
-- NOT RUN ANYWHERE YET. The app still keeps quiz and OPPE history in the browser (localStorage).
-- Run this in the Supabase SQL editor when you want history to follow a student across devices.
-- It is safe to run more than once. Nothing here stores question text or answers: the past-paper
-- data stays on the server, and these tables only hold what a student did.
--
-- What is in here
--   quiz_attempts          one row per finished MCQ test (mock, quick, custom, retry)
--   quiz_question_stats    one row per student and question: how often right or wrong, bookmarked
--   oppe_attempts          one row per finished OPPE mock
--   oppe_problem_progress  one row per student and OPPE problem: best result, last code
--   study_activity         one row per student and day, for streaks and a calendar
--   record_quiz_attempt()  one call from the app that writes the attempt and updates the rest
--   record_oppe_attempt()  the same for OPPE
--   quiz_subject_progress  view: attempts, average and best score per course
--   quiz_mistakes          view: the questions a student last got wrong or skipped

-- ── Shared helper ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.quiz_prep_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── MCQ attempts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- The id the browser gave the test. Lets the app upload the same attempt twice without a duplicate.
  client_id        TEXT NOT NULL,
  mode             TEXT NOT NULL CHECK (mode IN ('mock', 'quick', 'custom', 'retry')),
  kind             TEXT CHECK (kind IN ('quiz1', 'quiz2', 'endterm')),
  subject_id       TEXT,
  paper_id         TEXT,
  title            TEXT NOT NULL DEFAULT '',
  subtitle         TEXT NOT NULL DEFAULT '',
  total_questions  INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  correct          INTEGER NOT NULL DEFAULT 0 CHECK (correct >= 0),
  wrong            INTEGER NOT NULL DEFAULT 0 CHECK (wrong >= 0),   -- includes partly right answers
  skipped          INTEGER NOT NULL DEFAULT 0 CHECK (skipped >= 0),
  earned           NUMERIC(8, 2) NOT NULL DEFAULT 0,
  total_marks      NUMERIC(8, 2) NOT NULL DEFAULT 0,
  score_percent    NUMERIC(5, 2) GENERATED ALWAYS AS (
                     CASE WHEN total_marks > 0 THEN round(earned / total_marks * 100, 2) ELSE 0 END
                   ) STORED,
  time_limit_min   INTEGER,
  time_spent_sec   INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_sec >= 0),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- [{ "subjectId": "ct", "id": 123, "status": "wrong", "earned": 0, "marks": 3 }, ...]
  details          JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_finished ON public.quiz_attempts (user_id, finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_subject  ON public.quiz_attempts (user_id, subject_id);

-- ── Per-question stats and bookmarks ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_question_stats (
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id     TEXT NOT NULL,
  question_id    INTEGER NOT NULL,
  seen_count     INTEGER NOT NULL DEFAULT 0,
  correct_count  INTEGER NOT NULL DEFAULT 0,
  wrong_count    INTEGER NOT NULL DEFAULT 0,
  skipped_count  INTEGER NOT NULL DEFAULT 0,
  last_status    TEXT CHECK (last_status IN ('correct', 'partial', 'wrong', 'skipped')),
  last_seen_at   TIMESTAMPTZ,
  bookmarked     BOOLEAN NOT NULL DEFAULT false,
  bookmarked_at  TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subject_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_stats_mistakes  ON public.quiz_question_stats (user_id, subject_id) WHERE last_status IS DISTINCT FROM 'correct';
CREATE INDEX IF NOT EXISTS idx_quiz_stats_bookmarks ON public.quiz_question_stats (user_id, subject_id) WHERE bookmarked;

DROP TRIGGER IF EXISTS trg_quiz_stats_updated ON public.quiz_question_stats;
CREATE TRIGGER trg_quiz_stats_updated BEFORE UPDATE ON public.quiz_question_stats
  FOR EACH ROW EXECUTE FUNCTION public.quiz_prep_touch_updated_at();

-- ── OPPE attempts and per-problem progress ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.oppe_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id        TEXT NOT NULL,
  course           TEXT NOT NULL,                       -- python, pdsa, mlp, java, sql, system_commands
  exam             SMALLINT NOT NULL CHECK (exam IN (1, 2)),
  problems_total   INTEGER NOT NULL DEFAULT 0,
  problems_solved  INTEGER NOT NULL DEFAULT 0,
  score_percent    NUMERIC(5, 2),                       -- NULL when nothing in the set could be auto-checked
  time_limit_min   INTEGER,
  time_spent_sec   INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_sec >= 0),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- [{ "id": "p1", "title": "...", "difficulty": "Easy", "passed": 2, "total": 2, "solved": true }, ...]
  problems         JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- { "<problem id>": "<the code that was submitted>" }
  codes            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_oppe_attempts_user_finished ON public.oppe_attempts (user_id, finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_oppe_attempts_user_course   ON public.oppe_attempts (user_id, course);

CREATE TABLE IF NOT EXISTS public.oppe_problem_progress (
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id    TEXT NOT NULL,
  course        TEXT NOT NULL,
  exam          SMALLINT CHECK (exam IN (1, 2)),
  title         TEXT NOT NULL DEFAULT '',
  difficulty    TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  attempts      INTEGER NOT NULL DEFAULT 0,
  best_passed   INTEGER NOT NULL DEFAULT 0,
  best_total    INTEGER NOT NULL DEFAULT 0,
  solved        BOOLEAN NOT NULL DEFAULT false,
  last_code     TEXT,
  last_run_at   TIMESTAMPTZ,
  bookmarked    BOOLEAN NOT NULL DEFAULT false,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_oppe_progress_user_course ON public.oppe_problem_progress (user_id, course);

DROP TRIGGER IF EXISTS trg_oppe_progress_updated ON public.oppe_problem_progress;
CREATE TRIGGER trg_oppe_progress_updated BEFORE UPDATE ON public.oppe_problem_progress
  FOR EACH ROW EXECUTE FUNCTION public.quiz_prep_touch_updated_at();

-- ── Study activity (streaks, calendar) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_activity (
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day             DATE NOT NULL,                        -- the student's day, India time
  quizzes         INTEGER NOT NULL DEFAULT 0,
  questions       INTEGER NOT NULL DEFAULT 0,
  oppe_attempts   INTEGER NOT NULL DEFAULT 0,
  seconds         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- ── Row level security: a student sees and changes only their own rows ─────────
ALTER TABLE public.quiz_attempts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_question_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oppe_attempts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oppe_problem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_activity        ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['quiz_attempts', 'quiz_question_stats', 'oppe_attempts', 'oppe_problem_progress', 'study_activity']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "own rows select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "own rows insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "own rows update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "own rows delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "own rows select" ON public.%I FOR SELECT USING ((SELECT auth.uid()) = user_id)', t);
    EXECUTE format('CREATE POLICY "own rows insert" ON public.%I FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id)', t);
    EXECUTE format('CREATE POLICY "own rows update" ON public.%I FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)', t);
    EXECUTE format('CREATE POLICY "own rows delete" ON public.%I FOR DELETE USING ((SELECT auth.uid()) = user_id)', t);
  END LOOP;
END $$;

-- ── record_quiz_attempt: one call from the app after grading ───────────────────
-- Expects (all keys camelCase, times in epoch milliseconds):
--   { clientId, mode, kind, subjectId, paperId, title, subtitle, totalQuestions, correct, wrong,
--     skipped, earned, totalMarks, timeLimitMin, timeSpentSec, startedAt, finishedAt,
--     details: [{ subjectId, id, status, earned, marks }] }
-- Sending the same clientId again returns the existing attempt and changes nothing.
CREATE OR REPLACE FUNCTION public.record_quiz_attempt(p JSONB)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  uid      UUID := auth.uid();
  new_id   UUID;
  finished TIMESTAMPTZ := COALESCE(to_timestamp(NULLIF(p->>'finishedAt', '')::double precision / 1000), now());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  INSERT INTO public.quiz_attempts (
    user_id, client_id, mode, kind, subject_id, paper_id, title, subtitle,
    total_questions, correct, wrong, skipped, earned, total_marks,
    time_limit_min, time_spent_sec, started_at, finished_at, details
  )
  VALUES (
    uid, p->>'clientId', p->>'mode', NULLIF(p->>'kind', ''), NULLIF(p->>'subjectId', ''), NULLIF(p->>'paperId', ''),
    COALESCE(p->>'title', ''), COALESCE(p->>'subtitle', ''),
    COALESCE((p->>'totalQuestions')::int, 0), COALESCE((p->>'correct')::int, 0), COALESCE((p->>'wrong')::int, 0), COALESCE((p->>'skipped')::int, 0),
    COALESCE((p->>'earned')::numeric, 0), COALESCE((p->>'totalMarks')::numeric, 0),
    NULLIF(p->>'timeLimitMin', '')::int, COALESCE((p->>'timeSpentSec')::int, 0),
    COALESCE(to_timestamp(NULLIF(p->>'startedAt', '')::double precision / 1000), finished), finished,
    COALESCE(p->'details', '[]'::jsonb)
  )
  ON CONFLICT (user_id, client_id) DO NOTHING
  RETURNING id INTO new_id;

  IF new_id IS NULL THEN
    SELECT id INTO new_id FROM public.quiz_attempts WHERE user_id = uid AND client_id = p->>'clientId';
    RETURN new_id;
  END IF;

  -- Per-question counters, which is what the mistake bank reads.
  INSERT INTO public.quiz_question_stats AS s (
    user_id, subject_id, question_id, seen_count, correct_count, wrong_count, skipped_count, last_status, last_seen_at
  )
  SELECT
    uid,
    d->>'subjectId',
    (d->>'id')::int,
    1,
    (d->>'status' = 'correct')::int,
    (d->>'status' IN ('wrong', 'partial'))::int,
    (d->>'status' = 'skipped')::int,
    d->>'status',
    finished
  FROM jsonb_array_elements(COALESCE(p->'details', '[]'::jsonb)) AS d
  WHERE d->>'subjectId' IS NOT NULL AND d->>'id' IS NOT NULL AND d->>'status' IN ('correct', 'partial', 'wrong', 'skipped')
  ON CONFLICT (user_id, subject_id, question_id) DO UPDATE SET
    seen_count    = s.seen_count + 1,
    correct_count = s.correct_count + EXCLUDED.correct_count,
    wrong_count   = s.wrong_count + EXCLUDED.wrong_count,
    skipped_count = s.skipped_count + EXCLUDED.skipped_count,
    last_status   = EXCLUDED.last_status,
    last_seen_at  = EXCLUDED.last_seen_at;

  INSERT INTO public.study_activity AS a (user_id, day, quizzes, questions, seconds)
  VALUES (
    uid,
    (finished AT TIME ZONE 'Asia/Kolkata')::date,
    1,
    COALESCE((p->>'totalQuestions')::int, 0),
    COALESCE((p->>'timeSpentSec')::int, 0)
  )
  ON CONFLICT (user_id, day) DO UPDATE SET
    quizzes   = a.quizzes + 1,
    questions = a.questions + EXCLUDED.questions,
    seconds   = a.seconds + EXCLUDED.seconds;

  RETURN new_id;
END;
$$;

-- ── record_oppe_attempt: the same for an OPPE mock ─────────────────────────────
-- Expects (camelCase, epoch milliseconds):
--   { clientId, course, exam, problemsTotal, problemsSolved, scorePercent, timeLimitMin, timeSpentSec,
--     startedAt, finishedAt,
--     problems: [{ id, title, difficulty, passed, total, solved }],
--     codes: { "<problem id>": "<code>" } }
CREATE OR REPLACE FUNCTION public.record_oppe_attempt(p JSONB)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  uid      UUID := auth.uid();
  new_id   UUID;
  finished TIMESTAMPTZ := COALESCE(to_timestamp(NULLIF(p->>'finishedAt', '')::double precision / 1000), now());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  INSERT INTO public.oppe_attempts (
    user_id, client_id, course, exam, problems_total, problems_solved, score_percent,
    time_limit_min, time_spent_sec, started_at, finished_at, problems, codes
  )
  VALUES (
    uid, p->>'clientId', p->>'course', (p->>'exam')::smallint,
    COALESCE((p->>'problemsTotal')::int, 0), COALESCE((p->>'problemsSolved')::int, 0), NULLIF(p->>'scorePercent', '')::numeric,
    NULLIF(p->>'timeLimitMin', '')::int, COALESCE((p->>'timeSpentSec')::int, 0),
    COALESCE(to_timestamp(NULLIF(p->>'startedAt', '')::double precision / 1000), finished), finished,
    COALESCE(p->'problems', '[]'::jsonb), COALESCE(p->'codes', '{}'::jsonb)
  )
  ON CONFLICT (user_id, client_id) DO NOTHING
  RETURNING id INTO new_id;

  IF new_id IS NULL THEN
    SELECT id INTO new_id FROM public.oppe_attempts WHERE user_id = uid AND client_id = p->>'clientId';
    RETURN new_id;
  END IF;

  INSERT INTO public.oppe_problem_progress AS o (
    user_id, problem_id, course, exam, title, difficulty, attempts, best_passed, best_total, solved, last_code, last_run_at
  )
  SELECT
    uid,
    d->>'id',
    p->>'course',
    (p->>'exam')::smallint,
    COALESCE(d->>'title', ''),
    NULLIF(d->>'difficulty', ''),
    1,
    COALESCE((d->>'passed')::int, 0),
    COALESCE((d->>'total')::int, 0),
    COALESCE((d->>'solved')::boolean, false),
    p->'codes'->>(d->>'id'),
    finished
  FROM jsonb_array_elements(COALESCE(p->'problems', '[]'::jsonb)) AS d
  WHERE d->>'id' IS NOT NULL
  ON CONFLICT (user_id, problem_id) DO UPDATE SET
    attempts    = o.attempts + 1,
    best_passed = GREATEST(o.best_passed, EXCLUDED.best_passed),
    best_total  = GREATEST(o.best_total, EXCLUDED.best_total),
    solved      = o.solved OR EXCLUDED.solved,
    last_code   = COALESCE(EXCLUDED.last_code, o.last_code),
    last_run_at = EXCLUDED.last_run_at;

  INSERT INTO public.study_activity AS a (user_id, day, oppe_attempts, seconds)
  VALUES (uid, (finished AT TIME ZONE 'Asia/Kolkata')::date, 1, COALESCE((p->>'timeSpentSec')::int, 0))
  ON CONFLICT (user_id, day) DO UPDATE SET
    oppe_attempts = a.oppe_attempts + 1,
    seconds       = a.seconds + EXCLUDED.seconds;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_attempt(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_oppe_attempt(JSONB) TO authenticated;

-- ── Views (run as the signed-in student, so row level security still applies) ──
CREATE OR REPLACE VIEW public.quiz_subject_progress
WITH (security_invoker = true) AS
SELECT
  user_id,
  subject_id,
  count(*)                       AS attempts,
  round(avg(score_percent), 1)   AS average_percent,
  max(score_percent)             AS best_percent,
  sum(total_questions)           AS questions_answered,
  sum(time_spent_sec)            AS seconds_spent,
  max(finished_at)               AS last_attempt_at
FROM public.quiz_attempts
WHERE subject_id IS NOT NULL
GROUP BY user_id, subject_id;

CREATE OR REPLACE VIEW public.quiz_mistakes
WITH (security_invoker = true) AS
SELECT user_id, subject_id, question_id, wrong_count, skipped_count, seen_count, last_status, last_seen_at
FROM public.quiz_question_stats
WHERE last_status IS DISTINCT FROM 'correct';

GRANT SELECT ON public.quiz_subject_progress TO authenticated;
GRANT SELECT ON public.quiz_mistakes TO authenticated;

-- ── To undo everything in this file ────────────────────────────────────────────
-- DROP VIEW IF EXISTS public.quiz_mistakes, public.quiz_subject_progress;
-- DROP FUNCTION IF EXISTS public.record_quiz_attempt(JSONB), public.record_oppe_attempt(JSONB), public.quiz_prep_touch_updated_at();
-- DROP TABLE IF EXISTS public.study_activity, public.oppe_problem_progress, public.oppe_attempts, public.quiz_question_stats, public.quiz_attempts;
