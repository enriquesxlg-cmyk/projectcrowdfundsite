import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET_TOKEN;
  const provided = req.headers.get('x-admin-token') || req.headers.get('X-ADMIN-TOKEN');
  return !!secret && provided === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const supabaseAdmin = await getAdminClient();
    // Get recent reports
    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('id, campaign_id, reporter_id, reason, created_at, resolved')
      .order('created_at', { ascending: false })
      .limit(200);

    if (reportsError) throw reportsError;

  type ReportRow = { id: string; campaign_id: string; reporter_id: string; reason: string; created_at: string; resolved: boolean };
  const rows = (reports || []) as ReportRow[];
  const campaignIds = Array.from(new Set(rows.map((r: ReportRow) => r.campaign_id)));
  const reporterIds = Array.from(new Set(rows.map((r: ReportRow) => r.reporter_id)));

    // Fetch campaigns metadata
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('campaigns')
      .select('id, title, slug')
      .in('id', campaignIds.length ? campaignIds : ['00000000-0000-0000-0000-000000000000']);
    if (campaignsError) throw campaignsError;

    // Fetch reporter profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', reporterIds.length ? reporterIds : ['00000000-0000-0000-0000-000000000000']);
    if (profilesError) throw profilesError;

  type CampaignMeta = { id: string; title: string; slug: string };
  type ProfileMeta = { user_id: string; full_name: string | null };
  const campaignMap = new Map(((campaigns || []) as CampaignMeta[]).map((c: CampaignMeta) => [c.id, c] as const));
  const profileMap = new Map(((profiles || []) as ProfileMeta[]).map((p: ProfileMeta) => [p.user_id, p] as const));

    const enriched = rows.map((r: ReportRow) => ({
      ...r,
      campaign: campaignMap.get(r.campaign_id) || null,
      reporter: profileMap.get(r.reporter_id) || null,
    }));

    return NextResponse.json({ reports: enriched });
  } catch (err) {
    console.error('List reports error:', err);
    return NextResponse.json({ error: 'Failed to list reports' }, { status: 500 });
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
