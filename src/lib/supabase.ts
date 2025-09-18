import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'submitted' | 'acknowledged' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  location: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  voice_note_url?: string;
  user_email: string;
  user_phone?: string;
  assigned_to?: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  before_photo_url?: string;
  after_photo_url?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'admin' | 'staff';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  issue_id: string;
  type: 'status_update' | 'assignment' | 'resolution';
  title_en: string;
  title_hi: string;
  message_en: string;
  message_hi: string;
  read: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  issue_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}