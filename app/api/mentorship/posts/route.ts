import { NextResponse } from 'next/server';

function getSamplePosts(params: { company_id?: string | null; status?: string | null; featured?: string | null }) {
  const base = [
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
      },
    },
  ];

  let filtered = base;
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((p) => p.status === params.status);
  }
  if (params.company_id) {
    filtered = filtered.filter((p) => p.company_id === params.company_id);
  }
  if (params.featured) {
    const want = params.featured === 'true';
    filtered = filtered.filter((p) => p.featured === want);
  }
  return filtered;
}

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

// List posts (optionally by company or status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const status = searchParams.get('status'); // open, closed, draft
    const featured = searchParams.get('featured');

    // If admin client can't be created (e.g., no service key), return sample posts
    let supabase: any = null;
    try {
      supabase = await getAdminClient();
    } catch {
      const posts = getSamplePosts({ company_id, status, featured });
      return NextResponse.json({ posts });
    }

    let query = supabase
      .from('mentorship_posts')
      .select(`
        *,
        company:company_profiles!mentorship_posts_company_id_fkey (
          id,
          company_name,
          company_logo_url,
          primary_color,
          secondary_color
        )
      `)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (company_id) query = query.eq('company_id', company_id);
    if (status) query = query.eq('status', status);
    if (featured) query = query.eq('featured', featured === 'true');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      // Fallback to samples on error
      const posts = getSamplePosts({ company_id, status, featured });
      return NextResponse.json({ posts });
    }

    // If empty and not filtering by company, return samples to showcase
    if ((!data || data.length === 0) && !company_id) {
      const posts = getSamplePosts({ company_id, status, featured });
      return NextResponse.json({ posts });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (err) {
    console.error('Mentorship posts list error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// Create post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company_id,
      title,
      summary,
      description,
      skills,
      location,
      stipend_cents,
      apply_url,
      banner_image_url,
      status = 'open',
      featured = false,
      brand_primary_color,
      brand_secondary_color,
      cta_text,
      cta_subtext,
    } = body || {};

    if (!company_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    const { data, error } = await supabase
      .from('mentorship_posts')
      .insert({
        company_id,
        title,
        summary,
        description,
        skills,
        location,
        stipend_cents,
        apply_url,
        banner_image_url,
        status,
        featured,
        brand_primary_color,
        brand_secondary_color,
        cta_text,
        cta_subtext,
      })
      .select(`
        *,
        company:company_profiles!mentorship_posts_company_id_fkey (
          id,
          company_name,
          company_logo_url,
          primary_color,
          secondary_color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (err) {
    console.error('Mentorship posts create error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
