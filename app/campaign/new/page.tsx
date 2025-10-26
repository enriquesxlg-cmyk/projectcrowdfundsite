'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthComponent } from '@/components/AuthComponent';
import { toSlug } from '@/lib/slug';
import { supabase } from '@/lib/supabase';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    goal: '',
    category: 'education'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      const session = data?.session;
      if (!session) {
        setError('Please sign in to create a campaign');
        return;
      }
      setIsAuthenticated(true);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.story.trim()) {
      setError('Story is required');
      setIsSubmitting(false);
      return;
    }

    const goalAmount = parseFloat(formData.goal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      setError('Please enter a valid goal amount');
      setIsSubmitting(false);
      return;
    }

    const goalCents = Math.floor(goalAmount * 100);
    const slug = toSlug(formData.title);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to create a campaign');
        setIsSubmitting(false);
        return;
      }

      console.log('Creating campaign as user:', user.id);

      // First, ensure the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'Anonymous',
          });

        if (createProfileError) {
          console.error('Profile creation error:', createProfileError);
          setError('Failed to create user profile. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const { error: slugCheckError, count } = await supabase
        .from('campaigns')
        .select('id', { count: 'exact' })
        .eq('slug', slug);

      if (slugCheckError) {
        console.error('Slug check error:', slugCheckError);
        throw slugCheckError;
      }
      
      if (count && count > 0) {
        setError('A campaign with this title already exists. Please choose a different title.');
        setIsSubmitting(false);
        return;
      }

      // attempt to insert and capture full response for debugging
      const insertRes = await supabase
        .from('campaigns')
        .insert({
          title: formData.title,
          story: formData.story,
          goal_cents: goalCents,
          slug,
          owner_id: user.id,
          status: 'pending_review',
          category: formData.category || 'other',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .select();

      console.log('Insert result:', insertRes);

      const { data, error } = insertRes;
      if (error) {
        console.error('Insert error detail:', error);
        throw error;
      }
      
      router.push(`/campaign/${slug}`);
    } catch (e: any) {
      console.error('Campaign creation error:', e);
      setError(e.message || e.details || 'Failed to create campaign. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="text-center">
            <p className="mb-4">Please sign in to create a campaign</p>
            <AuthComponent />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Story
              </label>
              <textarea
                id="story"
                name="story"
                value={formData.story}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category (community focus)
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="social_justice">Social Justice</option>
                  <option value="lgbtq_plus">LGBTQ+</option>
                  <option value="disability">Disability</option>
                  <option value="immigrants_refugees">Immigrants & Refugees</option>
                  <option value="women_girls">Women & Girls</option>
                  <option value="indigenous">Indigenous</option>
                  <option value="art_culture">Art & Culture</option>
                  <option value="environment">Environment</option>
                  <option value="tech">Tech</option>
                  <option value="other">Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">We prioritize campaigns uplifting underrepresented communities.</p>
              </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
                Funding Goal ($)
              </label>
              <input
                type="number"
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}