/*
  # Create availability management tables

  1. New Tables
    - `available_dates`
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `created_at` (timestamp)
    - `available_times`
      - `id` (uuid, primary key)
      - `date_id` (uuid, foreign key to available_dates)
      - `time` (text, for HH:MM format)
      - `is_available` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage availability

  3. Constraints
    - Unique constraint on date in available_dates
    - Unique constraint on (date_id, time) in available_times
*/

-- Create available_dates table
CREATE TABLE IF NOT EXISTS available_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create available_times table
CREATE TABLE IF NOT EXISTS available_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_id uuid NOT NULL REFERENCES available_dates(id) ON DELETE CASCADE,
  time text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date_id, time)
);

-- Enable RLS
ALTER TABLE available_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_times ENABLE ROW LEVEL SECURITY;

-- Policies for available_dates
CREATE POLICY "Anyone can view available dates"
  ON available_dates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage available dates"
  ON available_dates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for available_times
CREATE POLICY "Anyone can view available times"
  ON available_times
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage available times"
  ON available_times
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS available_dates_date_idx ON available_dates(date);
CREATE INDEX IF NOT EXISTS available_times_date_id_idx ON available_times(date_id);
CREATE INDEX IF NOT EXISTS available_times_time_idx ON available_times(time);
CREATE INDEX IF NOT EXISTS available_times_is_available_idx ON available_times(is_available);