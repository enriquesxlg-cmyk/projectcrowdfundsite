'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  company_description: string | null;
  industry: string | null;
  primary_color: string;
  secondary_color: string;
}

export default function CompanyDirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch('/api/company/profile');
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Failed to load companies');
          return;
        }

        setCompanies(Array.isArray(data.company) ? data.company : []);
      } catch (err) {
        setError('Failed to load companies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Mentor Companies</h1>
        <p className="text-lg text-gray-600">
          Connect with companies committed to supporting underrepresented creators
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {companies.length === 0 && !error && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">No companies in the directory yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/company/${company.id}`}
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            {/* Logo */}
            <div className="mb-4 flex items-center justify-center">
              {company.company_logo_url ? (
                <img
                  src={company.company_logo_url}
                  alt={company.company_name}
                  className="h-20 w-20 object-contain"
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-lg text-2xl font-bold text-white"
                  style={{ backgroundColor: company.primary_color }}
                >
                  {company.company_name[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Company Name */}
            <h2 className="text-xl font-bold text-center mb-2 group-hover:text-purple-600 transition-colors">
              {company.company_name}
            </h2>

            {/* Industry */}
            {company.industry && (
              <p className="text-sm text-center text-gray-500 mb-3 capitalize">
                {company.industry}
              </p>
            )}

            {/* Description */}
            {company.company_description && (
              <p className="text-sm text-gray-600 text-center line-clamp-3">
                {company.company_description}
              </p>
            )}

            {/* CTA */}
            <div className="mt-4 text-center">
              <span
                className="inline-block text-sm font-medium group-hover:underline"
                style={{ color: company.primary_color }}
              >
                View Mentees →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Value Prop for Companies */}
      <div className="mt-16 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 border border-purple-100">
        <h2 className="text-2xl font-bold mb-4 text-center">For Companies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Build Your Brand</h3>
            <p className="text-sm text-gray-600">
              Showcase your commitment to diversity and social impact
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🤝</div>
            <h3 className="font-semibold mb-2">Find Talent</h3>
            <p className="text-sm text-gray-600">
              Connect with talented creators from underrepresented communities
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Track Impact</h3>
            <p className="text-sm text-gray-600">
              Measure and share your mentorship ROI and success stories
            </p>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link
            href="/company/register"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Register Your Company
          </Link>
        </div>
      </div>
    </main>
  );
}
