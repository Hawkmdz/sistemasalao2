/*
  # Add email column to profiles table

  1. Changes
    - Add email column to profiles table
    - Make email column unique and not nullable
    - Add trigger to automatically set email from auth.users

  2. Security
    - No changes to RLS policies needed
*/

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text UNIQUE NOT NULL DEFAULT '';

-- Create a function to get user's email from auth.users
CREATE OR REPLACE FUNCTION get_auth_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = (
    SELECT email 
    FROM auth.users 
    WHERE id = NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set email when profile is created
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'set_profile_email'
  ) THEN
    CREATE TRIGGER set_profile_email
      BEFORE INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION get_auth_email();
  END IF;
END $$;

-- Update existing profiles with emails from auth.users
UPDATE profiles
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE id = profiles.user_id
)
WHERE email = '';