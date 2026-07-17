-- Fix foreign key relationships for Doubts System

-- 1. Drop existing foreign key on doubts referencing auth.users(id)
ALTER TABLE doubts
DROP CONSTRAINT IF EXISTS doubts_user_id_fkey;

-- Add new foreign key referencing profiles(id)
ALTER TABLE doubts
ADD CONSTRAINT doubts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Drop existing foreign key on doubt_replies referencing auth.users(id)
ALTER TABLE doubt_replies
DROP CONSTRAINT IF EXISTS doubt_replies_user_id_fkey;

-- Add new foreign key referencing profiles(id)
ALTER TABLE doubt_replies
ADD CONSTRAINT doubt_replies_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
