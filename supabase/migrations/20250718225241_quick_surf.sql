/*
  # Create salon settings table

  1. New Tables
    - `salon_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `salon_settings` table
    - Add policy for authenticated users to manage settings
    - Add policy for anyone to read settings

  3. Initial Data
    - Insert default salon address
    - Insert default about me text
*/

CREATE TABLE IF NOT EXISTS salon_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read salon settings"
  ON salon_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage salon settings"
  ON salon_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO salon_settings (setting_key, setting_value) VALUES
  ('salon_address', 'Rua das Flores, 123 - Centro, Recife - PE'),
  ('about_me_text', 'Profissional especializada em beleza e bem-estar, com anos de experiência em transformar sonhos em realidade. Apaixonada por criar looks únicos que realçam a beleza natural de cada cliente.')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_salon_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_salon_settings_updated_at
  BEFORE UPDATE ON salon_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_salon_settings_updated_at();