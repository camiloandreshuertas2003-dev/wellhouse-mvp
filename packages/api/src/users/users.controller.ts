import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('users')
export class UsersController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getUsers() {
    try {
      const client = this.supabaseService.getClient();
      const { data: users, error } = await client.from('users').select('*');
      if (error) throw error;
      return { success: true, data: users };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      const client = this.supabaseService.getClient();
      const { data: user, error } = await client.from('users').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post()
  async createUser(@Body() userData: any) {
    try {
      const client = this.supabaseService.getClient();
      const { data: user, error } = await client.from('users').insert(userData).select().single();
      if (error) throw error;
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
