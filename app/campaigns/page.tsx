import { CampaignCard } from '@/components/CampaignCard';
import type { CampaignSummary } from '@/types/db';
import { CampaignSplitView } from '@/components/CampaignSplitView';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function envIsValid() {
  return typeof SUPABASE_URL === 'string' && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_ANON.length > 0;
}

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const selectedCategory = typeof sp.category === 'string' ? sp.category : undefined;
  const valid = envIsValid();

  // Fallback sample campaigns to display when database is empty or unreachable
  const SAMPLE_CAMPAIGNS: CampaignSummary[] = [
    {
      id: 'sample-1',
      title: 'Open-Source Laptop for Students',
      slug: 'sample-open-source-laptop',
      goal_cents: 5000000,
      raised_cents: 1750000,
      hero_image_url: null,
      status: 'approved',
      created_at: '2025-10-25T10:00:00.000Z',
      category: 'tech',
    },
    {
      id: 'sample-2',
      title: 'Community Tech Lab in East Side',
      slug: 'sample-community-tech-lab',
      goal_cents: 2000000,
      raised_cents: 680000,
      hero_image_url: null,
      status: 'approved',
      created_at: '2025-10-24T15:30:00.000Z',
      category: 'tech',
    },
    {
      id: 'sample-3',
      title: 'Girls Who Code: Summer Camp',
      slug: 'sample-girls-who-code',
      goal_cents: 1500000,
      raised_cents: 940000,
      hero_image_url: null,
      status: 'approved',
      created_at: '2025-10-23T12:00:00.000Z',
      category: 'education',
    },
    {
      id: 'sample-4',
      title: 'Accessible Health App for Seniors',
      slug: 'sample-accessible-health-app',
      goal_cents: 1200000,
      raised_cents: 250000,
      hero_image_url: null,
      status: 'approved',
      created_at: '2025-10-22T09:00:00.000Z',
      category: 'healthcare',
    },
    {
      id: 'sample-5',
      title: 'Indigenous Art & Culture Archive',
      slug: 'sample-indigenous-archive',
      goal_cents: 800000,
      raised_cents: 300000,
      hero_image_url: null,
      status: 'approved',
      created_at: '2025-10-21T14:00:00.000Z',
      category: 'art_culture',
    },
    {
      id: 'sample-6',
      title: 'Green Tech for Urban Gardens',
      slug: 'sample-green-tech-gardens',
      goal_cents: 3000000,
      raised_cents: 1100000,
      hero_image_url: null,
      status: 'approved',
      created_at: '2025-10-20T16:45:00.000Z',
      category: 'environment',
    },
  ];

  let campaigns: CampaignSummary[] = [];
  if (valid) {
    try {
      const qs = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : '';
      const base = process.env.NEXT_PUBLIC_BASE_URL || '';
      const res = await fetch(`${base}/api/campaigns/all${qs}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        campaigns = (json.campaigns || []) as CampaignSummary[];
      } else {
        campaigns = [];
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      campaigns = [];
    }
  }

  // If no real campaigns found, show sample ones and filter by category client-side
  if (campaigns.length === 0) {
    const filteredSamples = SAMPLE_CAMPAIGNS.filter((c) => {
      if (!selectedCategory || selectedCategory === 'all') return true;
      return c.category === selectedCategory;
    });
    campaigns = filteredSamples;
  }

  // Ensure consistent sorting (newest first) using created_at when available
  campaigns.sort((a: any, b: any) => {
    const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bd - ad;
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Campaigns</h1>
        <p className="text-gray-600">Explore active projects seeking support</p>
      </div>

      {!valid && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="font-semibold text-yellow-800">Supabase configuration issue</p>
            <p className="text-sm text-yellow-700 mt-1">
              The app cannot connect to Supabase because the NEXT_PUBLIC_SUPABASE_URL or anon key
              appears to be missing or malformed. Please open <code className="bg-gray-100 px-1 rounded">.env.local</code>,
              set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> to your project's URL (eg. https://your-project.supabase.co)
              and <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to the anon key. Then restart the dev server.
            </p>
          </div>
        </div>
      )}

      <section className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold">Filter by Category</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['all','education','healthcare','social_justice','lgbtq_plus','disability','immigrants_refugees','women_girls','indigenous','art_culture','environment','tech','other'].map(cat => {
            const isActive = (selectedCategory || 'all') === cat;
            const href = cat === 'all' ? '/campaigns' : `/campaigns?category=${encodeURIComponent(cat)}`;
            let label = cat.replace('_',' ').replace('_',' ');
            
            // Custom label mappings
            const labelMap: {[key: string]: string} = {
              'all': 'All',
              'education': 'Education',
              'healthcare': 'Healthcare',
              'social_justice': 'Social Justice',
              'lgbtq_plus': 'LGBTQ+',
              'disability': 'Disability',
              'immigrants_refugees': 'Immigrants/Refugees',
              'women_girls': 'Women/Girls',
              'indigenous': 'Indigenous',
              'art_culture': 'Art & Culture',
              'environment': 'Environment',
              'tech': 'Tech',
              'other': 'Other'
            };
            
            label = labelMap[cat] || label;
            return (
              <a
                key={cat}
                href={href}
                className={`px-3 py-1.5 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${isActive ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 border rounded-lg bg-gray-50 text-center text-gray-600">
            {valid ? 'No campaigns yet. Be the first to create one!' : 'No connection to Supabase.'}
          </div>
        ) : (
          <CampaignSplitView campaigns={campaigns} />
        )}
      </section>
    </main>
  );
}
