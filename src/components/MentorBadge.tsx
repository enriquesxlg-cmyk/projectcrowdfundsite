'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

interface Mentorship {
  id: string;
  mentorship_type: string;
  description: string;
  company: Company;
}

interface MentorBadgeProps {
  campaignId: string;
  menteeId?: string;
}

export default function MentorBadge({ campaignId, menteeId }: MentorBadgeProps) {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentorships() {
      try {
        const params = new URLSearchParams();
        if (campaignId) params.set('campaign_id', campaignId);
        if (menteeId) params.set('mentee_id', menteeId);

        const res = await fetch(`/api/mentorship?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
          setMentorships(data.mentorships || []);
        }
      } catch (err) {
        console.error('Failed to fetch mentorships:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMentorships();
  }, [campaignId, menteeId]);

  if (loading || mentorships.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">🤝 Mentored By</h3>
      <div className="space-y-3">
        {mentorships.map((mentorship) => (
          <Link
            key={mentorship.id}
            href={`/company/${mentorship.company.id}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-purple-300 hover:shadow-sm transition-all group"
          >
            {/* Logo */}
            {mentorship.company.company_logo_url ? (
              <img
                src={mentorship.company.company_logo_url}
                alt={mentorship.company.company_name}
                className="h-12 w-12 object-contain flex-shrink-0"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold flex-shrink-0"
                style={{ backgroundColor: mentorship.company.primary_color }}
              >
                {mentorship.company.company_name[0].toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                {mentorship.company.company_name}
              </div>
              {mentorship.mentorship_type && (
                <div className="text-xs text-gray-500 capitalize">
                  {mentorship.mentorship_type} Mentorship
                </div>
              )}
            </div>

            <div className="text-purple-600 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </Link>
        ))}
      </div>

      {mentorships[0]?.description && (
        <p className="text-sm text-gray-600 mt-3 italic">
          "{mentorships[0].description}"
        </p>
      )}
    </div>
  );
}
