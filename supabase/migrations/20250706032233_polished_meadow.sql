/*
  # Fix appointments table RLS policy for guest users

  1. Security Changes
    - Drop existing conflicting policies on appointments table
    - Create new comprehensive policies that allow:
      - Anonymous users to create appointments (for guest bookings)
      - Authenticated users to create appointments
      - Authenticated users to view, update, and delete appointments
    - Ensure guest users can successfully book appointments

  2. Policy Details
    - INSERT: Allow both anonymous and authenticated users
    - SELECT: Allow authenticated users to view all appointments
    - UPDATE: Allow authenticated users to update appointments
    - DELETE: Allow authenticated users to delete appointments
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

-- Create new comprehensive policies
CREATE POLICY "Allow appointment creation"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);