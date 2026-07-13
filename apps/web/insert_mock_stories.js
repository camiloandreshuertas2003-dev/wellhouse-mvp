const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (fs.existsSync('./.env.local')) {
  const envContent = fs.readFileSync('./.env.local', 'utf8')
  envContent.split('\n').forEach(line => {
    const parts = line.split('=')
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const val = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '') // remove quotes if any
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = val
    }
  })
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Querying properties...")
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, user_id, city, country')
    .limit(3)

  if (propError) {
    console.error("Error querying properties:", propError)
    process.exit(1)
  }

  if (!properties || properties.length === 0) {
    console.log("No properties found. Please create at least one property in the app first!")
    return
  }

  console.log(`Found ${properties.length} properties. Inserting mock stories...`)

  // YouTube Shorts ID lists
  const videoIds = ['5k_G7V6J7wM', 'd26Z_W25q8s', 'n1Fq121G0o0']

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i]
    const videoId = videoIds[i % videoIds.length]
    
    const story = {
      property_id: prop.id,
      user_id: prop.user_id,
      youtube_url: `https://www.youtube.com/shorts/${videoId}`,
      youtube_video_id: videoId,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      location_tags: `${prop.city || 'Colombia'}, ${prop.country || 'Colombia'}`
    }

    const { data, error } = await supabase
      .from('host_stories')
      .insert(story)
      .select()

    if (error) {
      console.error(`Error inserting story for property ${prop.id}:`, error)
    } else {
      console.log(`Successfully inserted story for property ${prop.city}:`, data[0].id)
    }
  }

  console.log("Done!")
}

run()
