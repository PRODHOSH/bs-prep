-- Add stars for resources notes and policies for per-user starring

CREATE TABLE IF NOT EXISTS resources_note_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES resources_notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_resources_note_stars_note_id ON resources_note_stars(note_id);
CREATE INDEX IF NOT EXISTS idx_resources_note_stars_user_id ON resources_note_stars(user_id);

ALTER TABLE resources_note_stars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view resources note stars" ON resources_note_stars;
CREATE POLICY "Anyone can view resources note stars"
  ON resources_note_stars FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can add own note stars" ON resources_note_stars;
CREATE POLICY "Authenticated users can add own note stars"
  ON resources_note_stars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can remove own note stars" ON resources_note_stars;
CREATE POLICY "Authenticated users can remove own note stars"
  ON resources_note_stars FOR DELETE
  USING (auth.uid() = user_id);