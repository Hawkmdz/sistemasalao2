/*
  # Create admin user and profile
  
  1. Changes
    - Creates an admin user with email admin@salon.com
    - Creates a profile for the admin user
    - Sets proper role and metadata
  
  2. Security
    - Password is hashed using bcrypt
    - Email is set as confirmed
    - Role is set to admin in user metadata
*/

-- First, create the admin user if it doesn't exist
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert the user and get their ID
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
  ) 
  SELECT
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
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@salon.com'
  )
  RETURNING id INTO new_user_id;

  -- If we got a new user ID, create their profile
  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      user_id,
      full_name,
      phone,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      'Administrador',
      '11999999999',
      now(),
      now()
    );
  END IF;
END $$;