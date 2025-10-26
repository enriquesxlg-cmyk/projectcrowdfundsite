import { NextResponse } from 'next/server';

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const campaign_id = searchParams.get('campaign_id');

    if (!slug && !campaign_id) {
      return NextResponse.json({ error: 'Missing slug or campaign_id' }, { status: 400 });
    }

    // If it's a sample campaign, return sample donations
    if (slug?.startsWith('sample-')) {
      const sampleDonations = [
        {
          id: 'donation-1',
          amount_cents: 5000,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_anonymous: false,
          donor: {
            user_id: 'sample-donor-1',
            full_name: 'Sarah Johnson',
            avatar_url: null,
          },
        },
        {
          id: 'donation-2',
          amount_cents: 2500,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          is_anonymous: true,
          donor: null,
        },
        {
          id: 'donation-3',
          amount_cents: 10000,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          is_anonymous: false,
          donor: {
            user_id: 'sample-donor-3',
            full_name: 'Marcus Chen',
            avatar_url: null,
          },
        },
        {
          id: 'donation-4',
          amount_cents: 1000,
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          is_anonymous: false,
          donor: {
            user_id: 'sample-donor-4',
            full_name: 'Priya Patel',
            avatar_url: null,
          },
        },
        {
          id: 'donation-5',
          amount_cents: 7500,
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          is_anonymous: true,
          donor: null,
        },
      ];
      return NextResponse.json({ donations: sampleDonations });
    }

    const supabase = await getAdminClient();

    // Find campaign by slug if needed
    let campaignId = campaign_id;
    if (!campaignId && slug) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('slug', slug)
        .single();
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      campaignId = campaign.id;
    }

    // Fetch donations with donor profiles
    const { data: donations, error } = await supabase
      .from('donations')
      .select(`
        id,
        amount_cents,
        is_anonymous,
        created_at,
        donor:profiles!donor_id (
          user_id,
          full_name,
          avatar_url
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching donations:', error);
      return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
    }

    // Transform donations to hide donor info if anonymous
    const transformedDonations = (donations || []).map((donation: any) => ({
      id: donation.id,
      amount_cents: donation.amount_cents,
      created_at: donation.created_at,
      is_anonymous: donation.is_anonymous,
      donor: donation.is_anonymous
        ? null
        : {
            user_id: donation.donor?.user_id,
            full_name: donation.donor?.full_name || 'Anonymous',
            avatar_url: donation.donor?.avatar_url,
          },
    }));

    return NextResponse.json({ donations: transformedDonations });
  } catch (err) {
    console.error('Donations list error:', err);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}
