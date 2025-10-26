import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET_TOKEN;
  const provided = req.headers.get('x-admin-token') || req.headers.get('X-ADMIN-TOKEN');
  return !!secret && provided === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const supabaseAdmin = await getAdminClient();
    const body = await req.json();
    const reportId: string | undefined = body?.reportId;
    if (!reportId) {
      return NextResponse.json({ error: 'reportId required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reports')
      .update({ resolved: true })
      .eq('id', reportId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Resolve report error:', err);
    return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 });
  }
}

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore suppress type resolution issue in editor; module exists at runtime
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}
