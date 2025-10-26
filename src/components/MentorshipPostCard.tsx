 'use client';

import Link from 'next/link';
import { formatMoney } from '@/lib/format';
export type MentorshipPost = {
  id: string;
  title: string;
  summary?: string | null;
  description: string;
  skills?: string | null;
  location?: string | null;
  stipend_cents?: number | null;
  apply_url?: string | null;
  banner_image_url?: string | null;
  status: string;
  featured: boolean;
  brand_primary_color?: string | null;
  brand_secondary_color?: string | null;
  cta_text?: string | null;
  cta_subtext?: string | null;
  company?: {
    id: string;
    company_name: string;
    company_logo_url?: string | null;
    primary_color?: string;
    secondary_color?: string;
  };
};

function dollars(cents?: number | null) {
  if (!cents) return null;
  return formatMoney(cents / 100);
}

export default function MentorshipPostCard({ post }: { post: MentorshipPost }) {
  const primary = post.brand_primary_color || post.company?.primary_color || '#9333ea';
  const secondary = post.brand_secondary_color || post.company?.secondary_color || '#ec4899';

  return (
    <Link
      href={`/mentorship/${post.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-purple-300 transition-all block"
    >
      {/* Banner */}
      <div className="h-28 w-full relative">
        {post.banner_image_url ? (
          <img
            src={post.banner_image_url}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              opacity: 0.2,
            }}
          />
        )}
      </div>

      <div className="p-5">
        {/* Company */}
        <div className="mb-3 flex items-center gap-3">
          {post.company?.company_logo_url ? (
            <img
              src={post.company.company_logo_url}
              alt={post.company.company_name}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div
              className="h-8 w-8 flex items-center justify-center rounded bg-white text-xs font-bold"
              style={{ backgroundColor: primary, color: 'white' }}
            >
              {post.company?.company_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="text-sm text-gray-700 font-medium">{post.company?.company_name}</div>
          {post.featured && (
            <span className="ml-auto text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: primary, color: 'white' }}>
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-1 group-hover:text-purple-700" style={{ color: primary }}>
          {post.title}
        </h3>
        {post.summary && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.summary}</p>}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
          {post.location && <span>📍 {post.location}</span>}
          {post.skills && <span>🛠️ {post.skills}</span>}
          {post.stipend_cents ? <span>💸 {dollars(post.stipend_cents)} stipend</span> : null}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: primary }}>
            {post.cta_text || 'Learn more'} →
          </span>
          <span className="text-xs text-gray-500">{post.status === 'open' ? 'Open' : 'Closed'}</span>
        </div>
      </div>
    </Link>
  );
}
