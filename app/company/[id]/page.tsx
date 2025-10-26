'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatMoney } from '@/lib/format';

interface Mentorship {
  id: string;
  status: string;
  mentorship_type: string;
  description: string;
  testimonial: string | null;
  mentee: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };
  campaign: {
    id: string;
    title: string;
    slug: string;
    status: string;
  } | null;
}

interface Company {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  company_description: string | null;
  company_website: string | null;
  industry: string | null;
  primary_color: string;
  secondary_color: string;
  linkedin_url: string | null;
  twitter_url: string | null;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch company profile
        const companyRes = await fetch(`/api/company/profile?company_id=${companyId}`);
        const companyData = await companyRes.json();
        
        if (!companyRes.ok) {
          setError(companyData.error || 'Failed to load company');
          setLoading(false);
          return;
        }

        setCompany(companyData.company);

        // Fetch mentorships
        const mentorshipsRes = await fetch(`/api/mentorship?company_id=${companyId}`);
        const mentorshipsData = await mentorshipsRes.json();
        
        if (mentorshipsRes.ok) {
          setMentorships(mentorshipsData.mentorships || []);
        }

        // Fetch mentorship posts (opportunities)
        const postsRes = await fetch(`/api/mentorship/posts?company_id=${companyId}&status=open`);
        const postsData = await postsRes.json();
        if (postsRes.ok) {
          setPosts(postsData.posts || []);
        }
      } catch (err) {
        setError('Failed to load company profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      </main>
    );
  }

  if (error || !company) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
          {error || 'Company not found'}
        </div>
      </main>
    );
  }

  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const completedMentorships = mentorships.filter(m => m.status === 'completed');

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Company Header */}
      <div
        className="rounded-xl p-8 mb-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${company.primary_color} 0%, ${company.secondary_color} 100%)`,
        }}
      >
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {company.company_logo_url ? (
              <img
                src={company.company_logo_url}
                alt={company.company_name}
                className="h-24 w-24 rounded-lg bg-white p-2 object-contain"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white/20 text-4xl font-bold">
                {company.company_name[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{company.company_name}</h1>
            {company.industry && (
              <p className="text-lg opacity-90 capitalize mb-3">{company.industry}</p>
            )}
            {company.company_description && (
              <p className="opacity-90 mb-4">{company.company_description}</p>
            )}

            {/* Links */}
            <div className="flex gap-3">
              {company.company_website && (
                <a
                  href={company.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  🌐 Website
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  💼 LinkedIn
                </a>
              )}
              {company.twitter_url && (
                <a
                  href={company.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  🐦 Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

  {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border border-purple-200 bg-white p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{mentorships.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Mentees</div>
        </div>
        <div className="rounded-lg border border-purple-200 bg-white p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{activeMentorships.length}</div>
          <div className="text-sm text-gray-600 mt-1">Active Mentorships</div>
        </div>
        <div className="rounded-lg border border-purple-200 bg-white p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{completedMentorships.length}</div>
          <div className="text-sm text-gray-600 mt-1">Completed Programs</div>
        </div>
        <div className="rounded-lg border border-purple-200 bg-white p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {mentorships.filter(m => m.campaign?.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Successful Campaigns</div>
        </div>
      </div>

      {/* Open Opportunities */}
      {posts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Open Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/mentorship/${post.id}`}
                className="group rounded-lg border border-gray-200 bg-white p-6 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="mb-2 flex items-center gap-2">
                  {company.company_logo_url ? (
                    <img src={company.company_logo_url} alt={company.company_name} className="h-6 w-6 object-contain" />
                  ) : (
                    <div className="h-6 w-6 flex items-center justify-center rounded bg-purple-600 text-white text-xs font-bold">
                      {company.company_name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-600">{company.company_name}</span>
                  {post.featured && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </div>
                <div className="font-semibold mb-1">{post.title}</div>
                {post.summary && <div className="text-sm text-gray-600 line-clamp-2">{post.summary}</div>}
                <div className="mt-3 text-sm text-gray-500 flex items-center gap-3">
                  {post.location && <span>📍 {post.location}</span>}
                  {post.stipend_cents ? <span>💸 {formatMoney(post.stipend_cents/100)}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Mentorships */}
      {activeMentorships.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Current Mentees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMentorships.map((mentorship) => (
              <div
                key={mentorship.id}
                className="rounded-lg border border-gray-200 bg-white p-6 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  {mentorship.mentee.avatar_url ? (
                    <img
                      src={mentorship.mentee.avatar_url}
                      alt={mentorship.mentee.full_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold"
                      style={{ backgroundColor: company.primary_color }}
                    >
                      {mentorship.mentee.full_name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${mentorship.mentee.user_id}`}
                      className="font-semibold hover:text-purple-600 block truncate"
                    >
                      {mentorship.mentee.full_name}
                    </Link>
                    {mentorship.mentorship_type && (
                      <p className="text-xs text-gray-500 capitalize">{mentorship.mentorship_type} Mentorship</p>
                    )}
                  </div>
                </div>

                {mentorship.campaign && (
                  <Link
                    href={`/campaign/${mentorship.campaign.slug}`}
                    className="block text-sm text-purple-600 hover:underline mb-2"
                  >
                    {mentorship.campaign.title}
                  </Link>
                )}

                {mentorship.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{mentorship.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Stories / Testimonials */}
      {completedMentorships.filter(m => m.testimonial).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Success Stories</h2>
          <div className="space-y-4">
            {completedMentorships
              .filter(m => m.testimonial)
              .map((mentorship) => (
                <div
                  key={mentorship.id}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    {mentorship.mentee.avatar_url ? (
                      <img
                        src={mentorship.mentee.avatar_url}
                        alt={mentorship.mentee.full_name}
                        className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-white text-xl font-bold"
                        style={{ backgroundColor: company.primary_color }}
                      >
                        {mentorship.mentee.full_name[0].toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="mb-3">
                        <Link
                          href={`/profile/${mentorship.mentee.user_id}`}
                          className="font-bold text-lg hover:text-purple-600"
                        >
                          {mentorship.mentee.full_name}
                        </Link>
                        {mentorship.campaign && (
                          <p className="text-sm text-gray-600">{mentorship.campaign.title}</p>
                        )}
                      </div>

                      <blockquote className="italic text-gray-700 border-l-4 border-purple-300 pl-4">
                        "{mentorship.testimonial}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {mentorships.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p>This company hasn't started any mentorships yet.</p>
        </div>
      )}
    </main>
  );
}
