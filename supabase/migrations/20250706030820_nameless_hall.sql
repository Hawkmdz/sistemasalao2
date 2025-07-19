/*
  # Fix guest appointments - Allow anonymous users to create appointments

  1. Changes
    - Update RLS policies to allow anonymous (public) users to insert appointments
    - Ensure the appointments table accepts insertions from non-authenticated users
    - Maintain security while allowing guest bookings

  2. Security
    - Anonymous users can only INSERT appointments
    - Authenticated users can manage all appointments
    - No data exposure to unauthorized users
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

-- Allow anonymous users to create appointments
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

-- Ensure the appointments table allows anonymous access for reading services
-- Update services policies to allow anonymous users to read services
DROP POLICY IF EXISTS "Allow public read access to services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON services;

CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage services"
  ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update availability policies to allow anonymous access
DROP POLICY IF EXISTS "Anyone can view available dates" ON available_dates;
DROP POLICY IF EXISTS "Authenticated users can manage available dates" ON available_dates;

CREATE POLICY "Anyone can view available dates"
  ON available_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage available dates"
  ON available_dates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update available_times policies
DROP POLICY IF EXISTS "Anyone can view available times" ON available_times;
DROP POLICY IF EXISTS "Authenticated users can manage available times" ON available_times;

CREATE POLICY "Anyone can view available times"
  ON available_times
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage available times"
  ON available_times
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update service_availability policies
DROP POLICY IF EXISTS "Anyone can view service availability" ON service_availability;
DROP POLICY IF EXISTS "Authenticated users can manage service availability" ON service_availability;

CREATE POLICY "Anyone can view service availability"
  ON service_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage service availability"
  ON service_availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);