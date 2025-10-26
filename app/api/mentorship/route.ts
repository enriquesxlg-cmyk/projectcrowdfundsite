import { NextResponse } from 'next/server';

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

// Get mentorships
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const mentee_id = searchParams.get('mentee_id');
    const campaign_id = searchParams.get('campaign_id');

    const supabase = await getAdminClient();

    let query = supabase
      .from('mentorships')
      .select(`
        *,
        company:company_profiles!mentorships_company_id_fkey (
          id,
          company_name,
          company_logo_url,
          primary_color,
          secondary_color
        ),
        mentee:profiles!mentorships_mentee_id_fkey (
          user_id,
          full_name,
          avatar_url
        ),
        campaign:campaigns (
          id,
          title,
          slug,
          status
        )
      `);

    if (company_id) {
      query = query.eq('company_id', company_id);
    }
    if (mentee_id) {
      query = query.eq('mentee_id', mentee_id);
    }
    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching mentorships:', error);
      return NextResponse.json({ error: 'Failed to fetch mentorships' }, { status: 500 });
    }

    return NextResponse.json({ mentorships: data || [] });
  } catch (err) {
    console.error('Mentorship route error:', err);
    return NextResponse.json({ error: 'Failed to fetch mentorships' }, { status: 500 });
  }
}

// Create mentorship
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company_id,
      mentee_id,
      campaign_id,
      mentorship_type,
      description,
      hours_committed,
    } = body;

    if (!company_id || !mentee_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    const { data, error } = await supabase
      .from('mentorships')
      .insert({
        company_id,
        mentee_id,
        campaign_id,
        mentorship_type,
        description,
        hours_committed,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mentorship:', error);
      return NextResponse.json({ error: 'Failed to create mentorship' }, { status: 500 });
    }

    // If campaign_id provided, update campaign with mentor
    if (campaign_id) {
      await supabase
        .from('campaigns')
        .update({ mentor_company_id: company_id })
        .eq('id', campaign_id);
    }

    return NextResponse.json({ mentorship: data });
  } catch (err) {
    console.error('Mentorship route error:', err);
    return NextResponse.json({ error: 'Failed to create mentorship' }, { status: 500 });
  }
}
