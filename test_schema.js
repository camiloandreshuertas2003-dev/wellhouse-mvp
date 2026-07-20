const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Use the ENV file from apps/web
require('dotenv').config({ path: path.join(__dirname, 'apps/web/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_schema_info')
  if (error) {
    // If RPC doesn't exist, try just getting a user
    const { data: users, error: userErr } = await supabase.from('users').select('*').limit(1)
    console.log('Users table columns:', users && users[0] ? Object.keys(users[0]) : userErr)
    const { data: exchanges, error: exErr } = await supabase.from('exchanges').select('*').limit(1)
    console.log('Exchanges table columns:', exchanges && exchanges[0] ? Object.keys(exchanges[0]) : exErr)
  }
}

checkSchema()
