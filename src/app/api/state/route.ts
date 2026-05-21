import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ data: data?.data ?? null });
  } catch (err) {
    console.error('GET /api/state error', err);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const data = body.data ?? null;

    const { error } = await supabase
      .from('app_state')
      .upsert({ id: 1, data });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/state error', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
