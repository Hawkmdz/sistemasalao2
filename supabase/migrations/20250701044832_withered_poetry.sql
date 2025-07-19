/*
  # Create user profiles table for role management

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `role` (text, default 'user')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for admins to view user profiles

  3. Changes
    - Creates the user_profiles table with proper primary key
    - Sets up RLS and policies
    - Inserts admin profile if admin user exists
*/

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_profiles' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Admins can view user profiles'
  ) THEN
    CREATE POLICY "Admins can view user profiles"
      ON user_profiles
      FOR SELECT
      TO public
      USING (role = 'admin');
  END IF;
END $$;

-- Insert admin profile if admin user exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email = 'admin@salon.com'
  LIMIT 1;
  
  -- If admin user exists, insert or update profile
  IF admin_user_id IS NOT NULL THEN
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = admin_user_id) THEN
      -- Update existing profile
      UPDATE user_profiles 
      SET role = 'admin' 
      WHERE id = admin_user_id;
    ELSE
      -- Insert new profile
      INSERT INTO user_profiles (id, role)
      VALUES (admin_user_id, 'admin');
    END IF;
  END IF;
END $$;