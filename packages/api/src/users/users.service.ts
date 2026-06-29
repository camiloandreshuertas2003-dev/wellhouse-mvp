import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByEmail(email: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('users').select('*').eq('email', email).single();
    if (error) return null;
    return data;
  }

  async create(userData: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('users').insert(userData).select().single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('users').select('*');
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
}
