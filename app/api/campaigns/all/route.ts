import { NextResponse } from 'next/server';

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore: module exists at runtime; suppress type resolution issue in editor
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    const supabase = await getAdminClient();
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';
    let query = supabase
      .from('campaigns')
      .select(`
        id, title, slug, goal_cents, raised_cents, hero_image_url, status, category, created_at,
        profiles ( user_id, full_name, avatar_url )
      `)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ campaigns: data || [] });
  } catch (err) {
    console.error('List all campaigns error:', err);
    return NextResponse.json({ error: 'Failed to list campaigns' }, { status: 500 });
  }
}
