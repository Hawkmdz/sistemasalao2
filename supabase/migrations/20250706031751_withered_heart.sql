/*
  # Fix RLS policies to allow guest appointments

  1. Changes
    - Drop and recreate all RLS policies to properly allow anonymous users
    - Ensure anon role can INSERT into appointments table
    - Ensure anon role can SELECT from all necessary tables
    - Fix policy syntax and permissions

  2. Security
    - Anonymous users can only INSERT appointments and SELECT services/availability
    - Authenticated users have full management access
    - Maintains security while allowing guest bookings
*/

-- First, ensure RLS is enabled on all tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

DROP POLICY IF EXISTS "Anyone can read services" ON services;
DROP POLICY IF EXISTS "Allow public read access to services" ON services;
DROP POLICY IF EXISTS "Authenticated users can manage services" ON services;

DROP POLICY IF EXISTS "Anyone can view available dates" ON available_dates;
DROP POLICY IF EXISTS "Authenticated users can manage available dates" ON available_dates;

DROP POLICY IF EXISTS "Anyone can view available times" ON available_times;
DROP POLICY IF EXISTS "Authenticated users can manage available times" ON available_times;

DROP POLICY IF EXISTS "Anyone can view service availability" ON service_availability;
DROP POLICY IF EXISTS "Authenticated users can manage service availability" ON service_availability;

-- APPOINTMENTS TABLE POLICIES
-- Allow anonymous and authenticated users to create appointments
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view all appointments
CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update appointments
CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete appointments
CREATE POLICY "Authenticated users can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);

-- SERVICES TABLE POLICIES
-- Allow everyone to read services
CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage services
CREATE POLICY "Authenticated users can manage services"
  ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AVAILABLE_DATES TABLE POLICIES
-- Allow everyone to view available dates
CREATE POLICY "Anyone can view available dates"
  ON available_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage available dates
CREATE POLICY "Authenticated users can manage available dates"
  ON available_dates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AVAILABLE_TIMES TABLE POLICIES
-- Allow everyone to view available times
CREATE POLICY "Anyone can view available times"
  ON available_times
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage available times
CREATE POLICY "Authenticated users can manage available times"
  ON available_times
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SERVICE_AVAILABILITY TABLE POLICIES
-- Allow everyone to view service availability
CREATE POLICY "Anyone can view service availability"
  ON service_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage service availability
CREATE POLICY "Authenticated users can manage service availability"
  ON service_availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON services TO anon;
GRANT SELECT ON available_dates TO anon;
GRANT SELECT ON available_times TO anon;
GRANT SELECT ON service_availability TO anon;
GRANT INSERT ON appointments TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;