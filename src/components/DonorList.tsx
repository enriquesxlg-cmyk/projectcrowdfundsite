'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDateShort } from '@/lib/format';

interface Donor {
  user_id?: string;
  full_name?: string;
  avatar_url?: string;
}

interface Donation {
  id: string;
  amount_cents: number;
  created_at: string;
  is_anonymous: boolean;
  donor: Donor | null;
}

interface DonorListProps {
  slug: string;
  campaignId?: string;
}

export default function DonorList({ slug, campaignId }: DonorListProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDonations() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (slug) params.set('slug', slug);
        if (campaignId) params.set('campaign_id', campaignId);

        const res = await fetch(`/api/donations/list?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load donations');
          return;
        }

        setDonations(data.donations || []);
      } catch (err) {
        setError('Failed to load donations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDonations();
  }, [slug, campaignId]);

  function formatAmount(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDateShort(date);
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-purple-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Donations</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-purple-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Donations</h3>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="rounded-lg border border-purple-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Donations</h3>
        <p className="text-sm text-gray-500">No donations yet. Be the first to support this campaign!</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Recent Donations ({donations.length})
      </h3>
      <div className="space-y-3">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-purple-50/30 p-3 transition-colors hover:bg-purple-50/50"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {donation.is_anonymous || !donation.donor ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-sm font-semibold text-white">
                  ?
                </div>
              ) : donation.donor.avatar_url ? (
                <img
                  src={donation.donor.avatar_url}
                  alt={donation.donor.full_name || 'Donor'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-sm font-semibold text-white">
                  {getInitials(donation.donor.full_name || 'Anonymous')}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {donation.is_anonymous || !donation.donor ? (
                    <p className="text-sm font-medium text-gray-900">Anonymous</p>
                  ) : donation.donor.user_id ? (
                    <Link
                      href={`/profile/${donation.donor.user_id}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline truncate block"
                    >
                      {donation.donor.full_name || 'Anonymous'}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {donation.donor.full_name || 'Anonymous'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{formatDate(donation.created_at)}</p>
                </div>
                <span className="text-sm font-semibold text-purple-600 whitespace-nowrap">
                  {formatAmount(donation.amount_cents)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
