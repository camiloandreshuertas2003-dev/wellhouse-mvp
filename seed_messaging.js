const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const { data: users } = await supabase.from('users').select('id, name').limit(2);
  if (users.length < 2) { console.log('Not enough users'); return; }
  
  const { data: props } = await supabase.from('properties').select('id, wp_price').eq('user_id', users[1].id).limit(1);
  const propertyId = props.length ? props[0].id : null;

  const { data: conv } = await supabase.from('conversations').insert({
    participant_a: users[0].id,
    participant_b: users[1].id,
    property_id: propertyId,
    status: 'chatting'
  }).select().single();

  await supabase.from('messages').insert({
    conversation_id: conv.id,
    sender_id: users[1].id,
    content: 'Hola, vi tu solicitud. ¿Aún estás interesado en las fechas?',
    message_type: 'text'
  });

  console.log('Seeded conversation between', users[0].name, 'and', users[1].name);
}

seed();
