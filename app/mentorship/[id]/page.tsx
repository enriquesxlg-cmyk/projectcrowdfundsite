'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { MentorshipPost } from '@/components/MentorshipPostCard';
import { formatMoney } from '@/lib/format';

export default function MentorshipPostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<MentorshipPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/mentorship/posts/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Not found');
          return;
        }
        setPost(data.post);
      } catch (e) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">{error || 'Post not found'}</div>
      </main>
    );
  }

  const primary = post.brand_primary_color || post.company?.primary_color || '#9333ea';
  const secondary = post.brand_secondary_color || post.company?.secondary_color || '#ec4899';

  return (
    <main className="container mx-auto px-0 md:px-4 pb-16">
      {/* Hero */}
      <div
        className="w-full py-12 text-white"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            {post.company?.company_logo_url ? (
              <img src={post.company.company_logo_url} alt={post.company.company_name} className="h-12 w-12 object-contain bg-white rounded-md p-1" />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center bg-white/20 rounded-md text-xl font-bold">
                {post.company?.company_name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm opacity-90">Mentorship by</div>
              <Link href={`/company/${post.company?.id}`} className="text-xl font-bold hover:underline">
                {post.company?.company_name}
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          {post.summary && <p className="text-lg opacity-90 max-w-3xl">{post.summary}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <div className="prose max-w-none">
            {post.description.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {post.skills && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {post.skills.split(',').map((s, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="rounded-lg border bg-white p-6">
            {post.location && (
              <p className="mb-2"><span className="font-semibold">Location:</span> {post.location}</p>
            )}
            {post.stipend_cents ? (
              <p className="mb-2"><span className="font-semibold">Stipend:</span> {formatMoney(post.stipend_cents/100)}</p>
            ) : null}
            <p className="mb-2"><span className="font-semibold">Status:</span> {post.status}</p>
            {post.cta_subtext && (
              <p className="text-sm text-gray-600 mb-4">{post.cta_subtext}</p>
            )}
            {post.apply_url ? (
              <a
                href={post.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 rounded-md text-white font-semibold"
                style={{ backgroundColor: primary }}
              >
                {post.cta_text || 'Apply Now'}
              </a>
            ) : (
              <p className="text-sm text-gray-600">Applications managed externally.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
