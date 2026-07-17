-- Create Doubts table
DROP TABLE IF EXISTS doubt_replies CASCADE;
DROP TABLE IF EXISTS doubts CASCADE;

CREATE TABLE IF NOT EXISTS doubts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Doubt Replies table
CREATE TABLE IF NOT EXISTS doubt_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  is_official_answer BOOLEAN DEFAULT false,
  is_accepted_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doubts_user_id ON doubts(user_id);
CREATE INDEX IF NOT EXISTS idx_doubts_subject ON doubts(subject);
CREATE INDEX IF NOT EXISTS idx_doubt_replies_doubt_id ON doubt_replies(doubt_id);

-- Enable RLS
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_replies ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- Policies for doubts
-- -------------------------------------------------------------

-- Anyone can read doubts
CREATE POLICY "Anyone can view doubts" ON doubts
  FOR SELECT USING (true);

-- Authenticated users can insert their own doubts
CREATE POLICY "Users can insert their own doubts" ON doubts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authors or admins can update their doubts (e.g. mark as resolved)
CREATE POLICY "Authors or admins can update doubts" ON doubts
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor'))
  );

-- Admins can delete doubts
CREATE POLICY "Admins can delete doubts" ON doubts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor'))
  );

-- -------------------------------------------------------------
-- Policies for doubt_replies
-- -------------------------------------------------------------

-- Anyone can read replies
CREATE POLICY "Anyone can view doubt replies" ON doubt_replies
  FOR SELECT USING (true);

-- Authenticated users can insert replies
CREATE POLICY "Users can insert doubt replies" ON doubt_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authors or admins can update their replies, or mark accepted
CREATE POLICY "Authors or admins can update doubt replies" ON doubt_replies
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor')) OR
    -- The author of the doubt can mark a reply as accepted
    EXISTS (SELECT 1 FROM doubts WHERE id = doubt_id AND user_id = auth.uid())
  );

-- Admins can delete replies
CREATE POLICY "Admins can delete doubt replies" ON doubt_replies
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor'))
  );


-- -------------------------------------------------------------
-- Storage Bucket for Doubts
-- -------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) 
VALUES ('doubts', 'doubts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Allow anyone to view images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'doubts');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload doubts images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'doubts' AND auth.role() = 'authenticated');

-- Allow users to delete their own images, or admins to delete any
CREATE POLICY "Users can delete their own doubts images" ON storage.objects 
  FOR DELETE USING (bucket_id = 'doubts' AND (auth.uid() = owner OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor'))));
