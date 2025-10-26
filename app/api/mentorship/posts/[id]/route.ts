import { NextResponse } from 'next/server';

function getSamplePosts() {
  return [
    {
      id: 'sample-aurora-1',
      company_id: 'sample-company-aurora',
      title: 'Open Source Hardware Mentorship',
      summary: 'Guide a cohort building sustainable IoT kits for community gardens.',
      description:
        'Aurora Tech is mentoring creators building open hardware for social good. You will receive dedicated guidance from senior engineers, weekly office hours, and resources to prototype and deploy in real communities.\n\nIdeal for folks interested in embedded systems, low-power design, and community impact.',
      skills: 'Embedded C, PCB Design, Sensors, Community Research',
      location: 'Remote (US/EU friendly)',
      stipend_cents: 150000,
      apply_url: 'https://example.com/apply/aurora',
      banner_image_url: null,
      status: 'open',
      featured: true,
      brand_primary_color: '#7c3aed',
      brand_secondary_color: '#f472b6',
      cta_text: 'Apply for Cohort',
      cta_subtext: 'Rolling applications through this quarter',
      company: {
        id: 'sample-company-aurora',
        company_name: 'Aurora Tech',
        company_logo_url: null,
        primary_color: '#7c3aed',
        secondary_color: '#f472b6',
        company_website: 'https://example.com/aurora',
      },
    },
    {
      id: 'sample-unity-1',
      company_id: 'sample-company-unity',
      title: 'Health Equity Product Mentorship',
      summary: 'Work with clinicians and PMs to deliver accessible health tools for seniors.',
      description:
        'Unity Health mentors cross-disciplinary projects focused on accessibility and inclusion. Expect research partnerships, IRB guidance, and usability testing support.\n\nGreat for teams building mobile apps for seniors or caregivers.',
      skills: 'UX Research, React Native, Accessibility, Healthcare',
      location: 'Hybrid (Austin, TX) or Remote',
      stipend_cents: 200000,
      apply_url: 'https://example.com/apply/unity',
      banner_image_url: null,
      status: 'open',
      featured: false,
      brand_primary_color: '#0ea5e9',
      brand_secondary_color: '#22c55e',
      cta_text: 'Start Application',
      cta_subtext: 'Priority review for early submissions',
      company: {
        id: 'sample-company-unity',
        company_name: 'Unity Health',
        company_logo_url: null,
        primary_color: '#0ea5e9',
        secondary_color: '#22c55e',
        company_website: 'https://example.com/unity',
      },
    },
    {
      id: 'sample-cultura-1',
      company_id: 'sample-company-cultura',
      title: 'Cultural Tech Storytelling Fellowship',
      summary: 'Mentorship for digital archives and community storytelling platforms.',
      description:
        'Cultura Labs supports projects preserving stories and art using modern web tooling. Fellows receive design critiques, legal templates, and micro-grants for digitization.\n\nIdeal for creators building platforms with lasting cultural impact.',
      skills: 'Next.js, Supabase, Content Strategy, Community Partnership',
      location: 'Remote (Americas time zones)',
      stipend_cents: 100000,
      apply_url: 'https://example.com/apply/cultura',
      banner_image_url: null,
      status: 'open',
      featured: true,
      brand_primary_color: '#db2777',
      brand_secondary_color: '#9333ea',
      cta_text: 'Nominate Your Project',
      cta_subtext: 'We welcome collectives and small orgs',
      company: {
        id: 'sample-company-cultura',
        company_name: 'Cultura Labs',
        company_logo_url: null,
        primary_color: '#db2777',
        secondary_color: '#9333ea',
        company_website: 'https://example.com/cultura',
      },
    },
  ];
}

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // If sample id, return sample content directly
    if (id.startsWith('sample-')) {
      const sample = getSamplePosts().find((p) => p.id === id);
      if (!sample) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      return NextResponse.json({ post: sample });
    }

    const supabase = await getAdminClient();

    const { data, error } = await supabase
      .from('mentorship_posts')
      .select(`
        *,
        company:company_profiles!mentorship_posts_company_id_fkey (
          id,
          company_name,
          company_logo_url,
          primary_color,
          secondary_color,
          company_website
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post: data });
  } catch (err) {
    console.error('Mentorship post detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
