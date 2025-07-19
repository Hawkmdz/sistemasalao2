export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'client';