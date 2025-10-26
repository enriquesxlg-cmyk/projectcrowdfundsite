"use client";

import { useEffect, useMemo, useState } from 'react';
import type { CampaignSummary } from '@/types/db';
import { ProgressBar } from './ProgressBar';
import { DonateWidget } from './DonateWidget';
import DonorList from './DonorList';
import { formatMoney } from '@/lib/format';

type DetailCampaign = {
  id: string;
  title: string;
  slug: string;
  story: string;
  category: string;
  goal_cents: number;
  raised_cents: number;
  deadline: string;
  hero_image_url: string | null;
  status: string;
  profiles?: { user_id: string; full_name: string | null; avatar_url: string | null };
};

export function CampaignSplitView({
  campaigns,
}: {
  campaigns: CampaignSummary[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ordered = useMemo(() => {
    // expect pre-sorted by server; keep as-is
    return campaigns;
  }, [campaigns]);

  useEffect(() => {
    if (!selectedSlug && ordered.length > 0) {
      setSelectedSlug(ordered[0].slug);
    }
  }, [ordered, selectedSlug]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!selectedSlug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/campaigns/by-slug/${encodeURIComponent(selectedSlug)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load campaign');
        }
        const data = await res.json();
        if (!ignore) setDetail(data.campaign as DetailCampaign);
      } catch (e: any) {
        if (!ignore) setError(e.message || 'Failed to load campaign');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [selectedSlug]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left list */}
      <div className="lg:col-span-1 border rounded-lg overflow-hidden">
        <div className="border-b px-4 py-3 bg-gray-50 font-medium">Campaigns</div>
        <ul className="max-h-[70vh] overflow-auto divide-y">
          {ordered.map((c) => {
            const active = c.slug === selectedSlug;
            const percent = Math.min(100, Math.floor((c.raised_cents / c.goal_cents) * 100));
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedSlug(c.slug)}
                  aria-selected={active}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${active ? 'bg-purple-50 border-l-2 border-purple-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold line-clamp-2">{c.title}</div>
                      <div className="text-xs text-gray-600 capitalize mt-0.5">{(c.status || '').replace('_',' ')}</div>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-nowrap">{percent}%</div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={percent} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right detail */}
      <div className="lg:col-span-2 border rounded-lg p-6 bg-white min-h-[60vh]">
        {!selectedSlug && <p className="text-gray-600">Select a campaign to view details</p>}
        {loading && <p className="text-gray-600">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {detail && !loading && !error && (
          <div>
            {detail.hero_image_url && (
              <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden">
                <img src={detail.hero_image_url} alt={detail.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h2 className="text-2xl font-bold mb-3">{detail.title}</h2>
            <div className="mb-4 flex items-center gap-3">
              {detail.profiles?.avatar_url ? (
                <img src={detail.profiles.avatar_url} alt={detail.profiles.full_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{(detail.profiles?.full_name || 'U')[0].toUpperCase()}</span>
                </div>
              )}
              <div className="text-sm text-gray-700">
                <div>
                  Created by{' '}
                  {detail.profiles?.user_id ? (
                    <a href={`/profile/${detail.profiles.user_id}`} className="text-blue-600 hover:underline font-medium">
                      {detail.profiles.full_name || 'Anonymous'}
                    </a>
                  ) : (
                    <span className="font-medium">{detail.profiles?.full_name || 'Anonymous'}</span>
                  )}
                </div>
                <div>Status: <span className="capitalize">{(detail.status || '').replace('_',' ')}</span></div>
              </div>
            </div>

            <div className="mb-6">
              <ProgressBar value={Math.min(100, Math.round((detail.raised_cents / detail.goal_cents) * 100))} />
              <div className="mt-2 text-gray-700">
                <span className="font-semibold">{formatMoney(detail.raised_cents/100)}</span> raised of {formatMoney(detail.goal_cents/100)} goal
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              {detail.story?.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {/* Donate widget uses demo wallet + server route when available */}
                {/* Some sample campaigns are always approved so demo donation works */}
                <DonateWidget campaign={detail as any} />
              </div>
              <div>
                <DonorList slug={detail.slug} campaignId={detail.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
