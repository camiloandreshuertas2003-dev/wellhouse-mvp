import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using placeholders for build.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

// Type-safe database queries
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          phone: string | null;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          role: string;
          plan: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: string | null;
          country: string | null;
          city: string | null;
          lat: number | null;
          lng: number | null;
          capacity: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area_m2: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      wellpoint_balances: {
        Row: {
          id: string;
          user_id: string;
          current_balance: number;
          total_earned_lifetime: number;
          total_spent_lifetime: number;
          last_activity_at: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wellpoint_balances']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['wellpoint_balances']['Insert']>;
      };
      wellpoint_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          balance_after: number;
          type: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wellpoint_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['wellpoint_transactions']['Insert']>;
      };
      member_levels: {
        Row: {
          id: string;
          user_id: string;
          level: string;
          level_reached_at: string;
        };
        Insert: Omit<Database['public']['Tables']['member_levels']['Row'], 'id' | 'level_reached_at'>;
        Update: Partial<Database['public']['Tables']['member_levels']['Insert']>;
      };
      hospitality_index: {
        Row: {
          id: string;
          user_id: string;
          index_value: number;
          calculated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hospitality_index']['Row'], 'id' | 'calculated_at'>;
        Update: Partial<Database['public']['Tables']['hospitality_index']['Insert']>;
      };
    };
  };
};
