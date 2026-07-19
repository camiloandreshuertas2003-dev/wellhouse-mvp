const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("No Supabase URL or Key found. Check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications' AND tablename = 'notifications'
  ) THEN
      CREATE POLICY "Users can view their own notifications"
          ON public.notifications
          FOR SELECT
          USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications' AND tablename = 'notifications'
  ) THEN
      CREATE POLICY "Users can update their own notifications"
          ON public.notifications
          FOR UPDATE
          USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'System can insert notifications' AND tablename = 'notifications'
  ) THEN
      CREATE POLICY "System can insert notifications"
          ON public.notifications
          FOR INSERT
          WITH CHECK (true);
  END IF;
END
$$;
  `;

  // We can use the REST API to execute SQL using the postgres meta endpoints or just by using a custom function.
  // Wait! supabase-js does not allow raw SQL execution natively without an RPC function.
  // Let me just create it via the Supabase MCP tool!
  console.log("Use MCP execute_sql instead of this script!");
}

run();
