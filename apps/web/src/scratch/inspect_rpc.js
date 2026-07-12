const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('c:/Users/camil/OneDrive/Desktop/CURSOAI para Developers/CLASE3/wellhouse-mvp/apps/web/.env', 'utf8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpsert() {
  console.log("Testing complete RPC upsert_property call with p_property_id...");
  
  // Try to find a valid user ID first to make the call realistic
  const { data: users } = await supabase.auth.admin?.listUsers ? await supabase.auth.admin.listUsers() : { data: [] };
  let userId = '00000000-0000-0000-0000-000000000000';
  
  const { data, error } = await supabase.rpc('upsert_property', {
    p_user_id:        userId,
    p_title:          'Test Finca Colonial con ID',
    p_description:    'El espacio: Test.\n\nLa zona: Test.\n\nCómo llegar: Test.',
    p_type:           'Casa',
    p_country:        'Colombia',
    p_city:           'Medellín',
    p_address:        'Calle 10 #43-25',
    p_capacity:       4,
    p_bedrooms:       2,
    p_bathrooms:      2,
    p_amenities:      ['wifi', 'kitchen'],
    p_images:         ['https://example.com/photo.jpg'],
    p_available_from: '2026-08-01',
    p_available_to:   '2026-08-30',
    p_min_stay:       2,
    p_max_stay:       15,
    p_rules:          'No party',
    p_status:         'published',
    p_wellscore:      4.2,
    p_property_id:    null // Explicitly passing null to resolve candidate overloading
  });

  console.log("Full RPC Call Result with p_property_id:", { data, error });
}

testUpsert();
