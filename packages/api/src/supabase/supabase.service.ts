import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>(
      'NEXT_PUBLIC_SUPABASE_URL',
    );
    const supabaseAnonKey = this.configService.get<string>(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Client with anon key (for client-side operations)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client with service role key (for server-side operations with elevated permissions)
    if (supabaseServiceRoleKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  // Helper methods for common operations
  async select(table: string, query?: any) {
    const { data, error } = await this.supabase.from(table).select(query);
    if (error) throw error;
    return data;
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select();
    if (error) throw error;
    return result;
  }

  async update(table: string, data: any, filter: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .match(filter)
      .select();
    if (error) throw error;
    return result;
  }

  async delete(table: string, filter: any) {
    const { error } = await this.supabase.from(table).delete().match(filter);
    if (error) throw error;
    return true;
  }
}
