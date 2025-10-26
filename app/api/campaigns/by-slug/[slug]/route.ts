import { NextResponse } from 'next/server';

function getSampleBySlug(slug: string) {
  const samples: Record<string, any> = {
    'sample-open-source-laptop': {
      id: 'sample-1',
      title: 'Open-Source Laptop for Students',
      story: 'We are creating an affordable, open-source laptop kit for students in underserved communities. Your support helps fund hardware kits, workshops, and mentorship.\n\nEvery donation brings us closer to empowering the next generation of makers.',
      slug,
      category: 'tech',
      goal_cents: 5000000,
      raised_cents: 1750000,
      deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      hero_image_url: null,
      status: 'approved',
      profiles: { user_id: 'sample-user-1', full_name: 'Demo Creator', avatar_url: null },
      created_at: '2025-10-25T10:00:00.000Z',
    },
    'sample-community-tech-lab': {
      id: 'sample-2',
      title: 'Community Tech Lab in East Side',
      story: 'Help us launch a community tech lab offering free access to tools, training, and mentorship.\n\nWe will provide workforce development and after-school programs focused on practical tech skills.',
      slug,
      category: 'tech',
      goal_cents: 2000000,
      raised_cents: 680000,
      deadline: new Date(Date.now() + 25*24*60*60*1000).toISOString(),
      hero_image_url: null,
      status: 'approved',
      profiles: { user_id: 'sample-user-2', full_name: 'Community Org', avatar_url: null },
      created_at: '2025-10-24T15:30:00.000Z',
    },
    'sample-girls-who-code': {
      id: 'sample-3',
      title: 'Girls Who Code: Summer Camp',
      story: 'We\'re raising funds for scholarships to provide laptops, instruction, and field trips for a coding summer camp dedicated to girls and non-binary youth.',
      slug,
      category: 'education',
      goal_cents: 1500000,
      raised_cents: 940000,
      deadline: new Date(Date.now() + 20*24*60*60*1000).toISOString(),
      hero_image_url: null,
      status: 'approved',
      profiles: { user_id: 'sample-user-3', full_name: 'STEM Collective', avatar_url: null },
      created_at: '2025-10-23T12:00:00.000Z',
    },
    'sample-accessible-health-app': {
      id: 'sample-4',
      title: 'Accessible Health App for Seniors',
      story: 'A simple, large-text health tracking app designed with seniors, for seniors. Funding supports accessibility research, UX testing, and initial deployment.\n\nOur mission is to bridge the digital divide for older adults.',
      slug,
      category: 'healthcare',
      goal_cents: 1200000,
      raised_cents: 250000,
      deadline: new Date(Date.now() + 28*24*60*60*1000).toISOString(),
      hero_image_url: null,
      status: 'approved',
      profiles: { user_id: 'sample-user-4', full_name: 'WellAging', avatar_url: null },
      created_at: '2025-10-22T09:00:00.000Z',
    },
    'sample-indigenous-archive': {
      id: 'sample-5',
      title: 'Indigenous Art & Culture Archive',
      story: 'We\'re building a digital archive to preserve indigenous art and oral histories in partnership with elders and artists. Funds support digitization and community workshops.',
      slug,
      category: 'art_culture',
      goal_cents: 800000,
      raised_cents: 300000,
      deadline: new Date(Date.now() + 35*24*60*60*1000).toISOString(),
      hero_image_url: null,
      status: 'approved',
      profiles: { user_id: 'sample-user-5', full_name: 'Cultural Commons', avatar_url: null },
      created_at: '2025-10-21T14:00:00.000Z',
    },
    'sample-green-tech-gardens': {
      id: 'sample-6',
      title: 'Green Tech for Urban Gardens',
      story: 'Solar-powered irrigation and sensor kits for community gardens to conserve water and improve yields. We\'re piloting in three neighborhoods this season.',
      slug,
      category: 'environment',
      goal_cents: 3000000,
      raised_cents: 1100000,
      deadline: new Date(Date.now() + 40*24*60*60*1000).toISOString(),
      hero_image_url: null,
      status: 'approved',
      profiles: { user_id: 'sample-user-6', full_name: 'GreenRoots', avatar_url: null },
      created_at: '2025-10-20T16:45:00.000Z',
    },
  };
  return samples[slug] || null;
}

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

export async function GET(_request: Request, context: { params: { slug: string } }) {
  try {
    const slug = context.params.slug;
    if (slug.startsWith('sample-')) {
      const sample = getSampleBySlug(slug);
      if (!sample) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ campaign: sample });
    }

    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        profiles ( user_id, full_name, avatar_url )
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    return NextResponse.json({ campaign: data });
  } catch (err) {
    console.error('Fetch campaign by slug error:', err);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}
