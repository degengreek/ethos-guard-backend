import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const handle = searchParams.get('handle');

  let query = supabase.from('users').select('twitter_handle, burner_address, ethos_score');

  if (address) {
    query = query.eq('burner_address', address);
  } else if (handle) {
    // Clean the handle: remove @ and trim
    const cleanHandle = handle.replace('@', '').trim();
    
    query = query.ilike('twitter_handle', cleanHandle);
  } else {
    return NextResponse.json({ error: 'Missing parameter: address or handle' }, { status: 400 });
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}