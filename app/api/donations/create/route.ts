import { NextResponse } from 'next/server';

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, campaign_id, amount_cents, is_anonymous, donor_id } = body || {};

    if (!amount_cents || typeof amount_cents !== 'number' || amount_cents <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    // Find campaign
    let campaignId = campaign_id as string | undefined;
    if (!campaignId && slug) {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('id, raised_cents, status')
        .eq('slug', slug)
        .single();
      if (error || !campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      if (campaign.status !== 'approved') {
        return NextResponse.json({ error: 'Campaign not accepting donations' }, { status: 400 });
      }
      campaignId = campaign.id;
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaign identifier' }, { status: 400 });
    }

    // Read current raised
    const { data: current, error: readErr } = await supabase
      .from('campaigns')
      .select('raised_cents, status')
      .eq('id', campaignId)
      .single();
    if (readErr || !current) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (current.status !== 'approved') {
      return NextResponse.json({ error: 'Campaign not accepting donations' }, { status: 400 });
    }

    const newRaised = (current.raised_cents || 0) + amount_cents;

    // Update raised_cents
    const { error: updateErr } = await supabase
      .from('campaigns')
      .update({ raised_cents: newRaised })
      .eq('id', campaignId);
    if (updateErr) {
      console.error('Donation update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }

    // Optional: insert donation record if table exists (best-effort)
    try {
      const donationData: any = {
        campaign_id: campaignId,
        amount_cents: amount_cents,
        is_anonymous: !!is_anonymous,
      };
      
      // Add donor_id if provided (for logged-in users)
      if (donor_id) {
        donationData.donor_id = donor_id;
      }
      
      await supabase.from('donations').insert(donationData);
    } catch (e) {
      // ignore if donations table or constraints don't allow
      console.error('Donation insert error:', e);
    }

    return NextResponse.json({ ok: true, new_raised_cents: newRaised });
  } catch (err) {
    console.error('Donation route error:', err);
    return NextResponse.json({ error: 'Failed to process donation' }, { status: 500 });
  }
}
