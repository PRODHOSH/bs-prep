-- Fix the infinite recursion error in profiles RLS policies

-- 1. Drop the recursive and restrictive SELECT policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles viewable by all" ON profiles;

-- 2. Create a single SELECT policy allowing anyone to read profiles
-- (This is required so students can see the authors of doubts and vice versa, 
-- and it completely avoids the infinite recursion caused by querying profiles within the policy)
CREATE POLICY "Public profiles viewable by all"
  ON profiles
  FOR SELECT
  USING (true);

-- 3. Fix the UPDATE policy for admins
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- To prevent infinite recursion on UPDATE, we use a SECURITY DEFINER function
-- which bypasses RLS when checking the user's role.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
