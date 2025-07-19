/*
  # Create admin user for barbershop application

  1. Changes
    - Creates an admin user with email admin@salon.com and password Admin@123
    - Creates a profile for the admin user
    - Sets proper role and metadata

  2. Security
    - Password is hashed using bcrypt
    - Email is set as confirmed
    - Role is set to admin in user metadata
*/

-- First, check if admin user already exists and delete if necessary
DELETE FROM auth.users WHERE email = 'admin@salon.com';

-- Insert the admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@salon.com',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create profile for admin user
INSERT INTO public.profiles (
  user_id,
  full_name,
  phone,
  email,
  created_at,
  updated_at
) 
SELECT 
  id,
  'Administrador',
  '11999999999',
  'admin@salon.com',
  now(),
  now()
FROM auth.users 
WHERE email = 'admin@salon.com';