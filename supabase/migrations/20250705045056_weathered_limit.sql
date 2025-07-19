/*
  # Fix appointments RLS policy for public access

  1. Changes
    - Update RLS policies for appointments table to allow public insert
    - Ensure authenticated users can manage all appointments
    - Allow public users to create appointments without authentication

  2. Security
    - Public users can only INSERT appointments
    - Authenticated users can SELECT, UPDATE, DELETE appointments
    - Maintains data security while allowing public booking
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated users to manage appointments" ON appointments;

-- Create new policies with correct permissions
CREATE POLICY "Public can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);