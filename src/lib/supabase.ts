import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type UserRole = 'admin' | 'client';

export const signUp = async (email: string, password: string, role: UserRole = 'client') => {
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      if (error.message.includes('User already registered')) {
        throw new Error('Este email já está cadastrado. Por favor, faça login.');
      }
      if (error.message.includes('Email signups are disabled')) {
        throw new Error('Cadastro de novos usuários está temporariamente desabilitado. Entre em contato com o administrador.');
      }
      throw new Error('Erro ao criar usuário: ' + error.message);
    }

    if (!data?.user) {
      throw new Error('Não foi possível criar o usuário. Tente novamente.');
    }

    return data;
  } catch (error) {
    console.error('SignUp error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signin error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou senha incorretos');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Por favor, confirme seu email antes de fazer login');
      }
      throw new Error('Erro ao fazer login: ' + error.message);
    }

    if (!data?.user || !data?.session) {
      throw new Error('Erro de autenticação');
    }

    // Check if user is admin based on email
    if (email === 'admin@salon.com') {
      // Update user metadata to include admin role
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      data.user.user_metadata = { ...data.user.user_metadata, role: 'admin' };
    }

    return data;
  } catch (error) {
    console.error('SignIn error:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      user.user_metadata = { ...user.user_metadata, needsProfile: true };
    }

    // Set admin role for admin email
    if (user.email === 'admin@salon.com') {
      user.user_metadata = { ...user.user_metadata, role: 'admin' };
    }

    return user;
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    await signOut();
    return null;
  }
};

// Function to create appointment for both guest and authenticated users
export const createAppointment = async (appointmentData: {
  client_name: string;
  service_id: string;
  date: string;
  time: string;
}) => {
  try {
    console.log('Creating appointment with data:', appointmentData);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        client_name: appointmentData.client_name,
        service_id: appointmentData.service_id,
        date: appointmentData.date,
        time: appointmentData.time,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Erro ao criar agendamento: ' + error.message);
    }

    console.log('Appointment created successfully:', data);
    return data;
  } catch (error) {
    console.error('CreateAppointment error:', error);
    throw error;
  }
};