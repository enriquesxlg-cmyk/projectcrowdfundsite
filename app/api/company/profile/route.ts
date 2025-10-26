import { NextResponse } from 'next/server';

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

// Get company profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const user_id = searchParams.get('user_id');

    const supabase = await getAdminClient();

    let query = supabase
      .from('company_profiles')
      .select(`
        *,
        profiles!company_profiles_user_id_fkey (
          user_id,
          full_name,
          avatar_url
        )
      `);

    if (company_id) {
      query = query.eq('id', company_id).single();
    } else if (user_id) {
      query = query.eq('user_id', user_id).single();
    } else {
      // Return all companies in directory
      query = query.eq('show_in_directory', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching company profile:', error);
      return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
    }

    return NextResponse.json({ company: data });
  } catch (err) {
    console.error('Company profile route error:', err);
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
  }
}

// Create or update company profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      company_name,
      company_logo_url,
      company_website,
      company_description,
      industry,
      primary_color,
      secondary_color,
      custom_domain,
      show_in_directory,
      showcase_mentees,
      contact_email,
      linkedin_url,
      twitter_url,
    } = body;

    if (!user_id || !company_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    // Check if company profile already exists
    const { data: existing } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('company_profiles')
        .update({
          company_name,
          company_logo_url,
          company_website,
          company_description,
          industry,
          primary_color,
          secondary_color,
          custom_domain,
          show_in_directory,
          showcase_mentees,
          contact_email,
          linkedin_url,
          twitter_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company profile:', error);
        return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
      }

      return NextResponse.json({ company: data });
    } else {
      // Create new
      const { data, error } = await supabase
        .from('company_profiles')
        .insert({
          user_id,
          company_name,
          company_logo_url,
          company_website,
          company_description,
          industry,
          primary_color: primary_color || '#9333ea',
          secondary_color: secondary_color || '#ec4899',
          custom_domain,
          show_in_directory: show_in_directory !== false,
          showcase_mentees: showcase_mentees !== false,
          contact_email,
          linkedin_url,
          twitter_url,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating company profile:', error);
        return NextResponse.json({ error: 'Failed to create company profile' }, { status: 500 });
      }

      // Update user profile to mark as company
      await supabase
        .from('profiles')
        .update({ user_type: 'company', company_id: data.id })
        .eq('user_id', user_id);

      return NextResponse.json({ company: data });
    }
  } catch (err) {
    console.error('Company profile route error:', err);
    return NextResponse.json({ error: 'Failed to save company profile' }, { status: 500 });
  }
}
