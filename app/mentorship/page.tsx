'use client';

import { useEffect, useState } from 'react';
import MentorshipPostCard, { MentorshipPost } from '@/components/MentorshipPostCard';

export default function MentorshipDirectoryPage() {
  const [posts, setPosts] = useState<MentorshipPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'open' | 'closed' | 'all'>('open');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        const res = await fetch(`/api/mentorship/posts?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load');
          return;
        }
        setPosts(data.posts || []);
      } catch (e) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mentorship Opportunities</h1>
        <p className="text-gray-600">Company-sponsored mentorships tailored to help creators grow</p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setStatus('open')}
          className={`px-3 py-1.5 text-sm rounded-md ${status==='open'?'bg-purple-600 text-white':'text-gray-700 hover:bg-purple-50'}`}
        >Open</button>
        <button
          onClick={() => setStatus('closed')}
          className={`px-3 py-1.5 text-sm rounded-md ${status==='closed'?'bg-purple-600 text-white':'text-gray-700 hover:bg-purple-50'}`}
        >Closed</button>
        <button
          onClick={() => setStatus('all')}
          className={`px-3 py-1.5 text-sm rounded-md ${status==='all'?'bg-purple-600 text-white':'text-gray-700 hover:bg-purple-50'}`}
        >All</button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <MentorshipPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
