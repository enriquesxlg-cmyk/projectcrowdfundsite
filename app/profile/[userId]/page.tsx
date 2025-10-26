import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { CampaignCard } from '@/components/CampaignCard';
import { formatDateShort } from '@/lib/format';
import type { Campaign } from '@/types/db';

async function getProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url, created_at')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

async function getUserCampaigns(userId: string) {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, title, slug, goal_cents, raised_cents, hero_image_url, status, created_at')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }

  return campaigns || [];
}

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const profile = await getProfile(userId);

  if (!profile) {
    notFound();
  }

  const campaigns = await getUserCampaigns(userId);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {(profile.full_name || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{profile.full_name || 'Anonymous User'}</h1>
              <p className="text-gray-600">
                Member since {formatDateShort(profile.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Campaigns ({campaigns.length})
          </h2>
          {campaigns.length === 0 ? (
            <div className="p-8 border rounded-lg bg-gray-50 text-center text-gray-600">
              This user hasn't created any campaigns yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  title={campaign.title}
                  goalCents={campaign.goal_cents}
                  raisedCents={campaign.raised_cents}
                  status={campaign.status}
                  href={`/campaign/${campaign.slug}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
