import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { DonateWidget } from '@/components/DonateWidget';
import type { Metadata } from 'next';
import { ReportButton } from '../../../src/components/ReportButton';
import { formatMoney } from '@/lib/format';
import { ProgressBar } from '@/components/ProgressBar';
import DonorList from '@/components/DonorList';
import MentorBadge from '@/components/MentorBadge';

async function getCampaign(slug: string) {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      profiles (
        user_id,
        full_name,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !campaign) {
    // Fallback: render sample campaigns by slug pattern
    if (slug.startsWith('sample-')) {
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
        },
      };
      return samples[slug] || null;
    }
    console.error('Error fetching campaign:', error);
    return null;
  }

  return campaign;
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  const progress = Math.min(Math.round((campaign.raised_cents / campaign.goal_cents) * 100), 100);
  const goalAmount = campaign.goal_cents / 100;
  const raisedAmount = campaign.raised_cents / 100;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {campaign.hero_image_url && (
          <div className="aspect-video w-full mb-8 rounded-lg overflow-hidden">
            <img
              src={campaign.hero_image_url}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
            
            <div className="mb-8 flex items-center gap-3">
              {campaign.profiles?.avatar_url ? (
                <img
                  src={campaign.profiles.avatar_url}
                  alt={campaign.profiles.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">
                    {(campaign.profiles?.full_name || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-gray-600">
                  Created by{' '}
                    <a 
                      href={`/profile/${campaign.profiles.user_id}`}
                      className="text-purple-600 hover:underline font-medium"
                  >
                    {campaign.profiles.full_name || 'Anonymous'}
                  </a>
                </p>
                <p className="text-gray-600">
                  Status: <span className="capitalize">{campaign.status.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            <div className="prose max-w-none">
              {campaign.story.split('\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Donor List Section */}
            <div className="mt-8">
              <DonorList slug={campaign.slug} campaignId={campaign.id} />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
              <div>
                <ProgressBar value={progress} />
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold">{formatMoney(raisedAmount)}</p>
                  <p className="text-gray-600">raised of {formatMoney(goalAmount)} goal</p>
                </div>
              </div>

              {/* Mentor Badge */}
              <MentorBadge campaignId={campaign.id} menteeId={campaign.profiles?.user_id} />

              {campaign.status === 'approved' && (
                <>
                  <DonateWidget campaign={campaign} />
                  <p className="text-xs text-gray-500 mt-3">
                    If you choose to donate anonymously, your name won’t be shown publicly. The campaign owner
                    will see your donation amount but not your name. Receipts are still emailed to you.
                  </p>
                </>
              )}

              {campaign.status === 'pending_review' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800">
                    This campaign is pending review. Once approved, donors will be able to contribute.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <ReportButton campaignId={campaign.id} />
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const ogImage = baseUrl
    ? `${baseUrl}/api/og/campaign/${slug}`
    : `/api/og/campaign/${slug}`;
  return {
    openGraph: {
      images: [{ url: ogImage }],
    },
    twitter: {
      images: [ogImage],
      card: 'summary_large_image',
    },
  };
}