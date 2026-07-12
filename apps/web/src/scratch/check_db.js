const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env variables manually
const envContent = fs.readFileSync('c:/Users/camil/OneDrive/Desktop/CURSOAI para Developers/CLASE3/wellhouse-mvp/apps/web/.env', 'utf8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
    env[key] = val;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("Checking Supabase connection...");
  const { data: prop, error } = await supabase
    .from('properties')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error reading properties table:", error);
  } else {
    console.log("Properties schema columns:");
    if (prop && prop.length > 0) {
      console.log(Object.keys(prop[0]));
    } else {
      console.log("Table is empty, checking columns individually...");
    }
    
    // Check key columns individually to verify existence
    const testCols = [
      'id', 'title', 'category', 'images', 'description_space', 
      'description_area', 'description_directions', 'available_from',
      'available_to', 'min_stay', 'max_stay', 'rules', 'wellscore',
      'lat', 'lng', 'area_m2', 'status', 'description', 'city', 'country'
    ];
    for (const col of testCols) {
      const { error: colErr } = await supabase.from('properties').select(col).limit(1);
      console.log(`Column '${col}':`, colErr ? `❌ NO (${colErr.message})` : '✅ YES');
    }
  }
}

check();
