/*
  # Add initial admin user

  1. Changes
    - Insert initial admin user with email and password
    - Set user role as 'admin'

  Note: The password will be hashed by Supabase automatically
*/

-- Insert initial admin settings
INSERT INTO admin_settings (email)
VALUES ('admin@barber-bourbon.com');