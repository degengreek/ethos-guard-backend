import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const address = (await params).address;

  if (!address) {
     return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('burner_address', address)
    .single();

  if (error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: data });
}
