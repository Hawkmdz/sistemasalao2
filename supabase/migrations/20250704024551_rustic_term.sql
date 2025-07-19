/*
  # Add service-specific availability system

  1. New Tables
    - `service_availability`
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key to services)
      - `date_id` (uuid, foreign key to available_dates)
      - `time` (text, for HH:MM format)
      - `is_available` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on service_availability table
    - Add policies for public read and authenticated management

  3. Constraints
    - Unique constraint on (service_id, date_id, time)
    - Foreign key constraints for data integrity
*/

-- Create service_availability table
CREATE TABLE IF NOT EXISTS service_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date_id uuid NOT NULL REFERENCES available_dates(id) ON DELETE CASCADE,
  time text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(service_id, date_id, time)
);

-- Enable RLS
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;

-- Policies for service_availability
CREATE POLICY "Anyone can view service availability"
  ON service_availability
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage service availability"
  ON service_availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS service_availability_service_id_idx ON service_availability(service_id);
CREATE INDEX IF NOT EXISTS service_availability_date_id_idx ON service_availability(date_id);
CREATE INDEX IF NOT EXISTS service_availability_time_idx ON service_availability(time);
CREATE INDEX IF NOT EXISTS service_availability_is_available_idx ON service_availability(is_available);