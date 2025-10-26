import type { CampaignSummary } from '@/types/db';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function envIsValid() {
  return typeof SUPABASE_URL === 'string' && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_ANON.length > 0;
}

export default async function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto mb-16 py-12">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 opacity-20 blur-2xl rounded-full transform scale-150"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rotate-6 rounded-lg"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 -rotate-6 rounded-lg"></div>
            <h1 className="relative text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent px-8 py-2">
              NexaFund
            </h1>
          </div>
          <p className="text-2xl text-gray-700 font-medium mb-6">
            Empowering communities through crowdfunding
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            NexaFund is a platform dedicated to amplifying voices and funding projects from underrepresented communities. 
            Whether you're launching a tech initiative, healthcare program, or cultural archive, we provide the tools 
            and community support to bring your vision to life.
          </p>
        </div>
        
        <div className="flex justify-center gap-4 mb-12">
          <Link
            href="/campaigns"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Browse Campaigns
          </Link>
          <Link
            href="/success-stories"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Success Stories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur border">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-semibold text-lg mb-2">Launch Your Campaign</h3>
            <p className="text-sm text-gray-600">Create a campaign in minutes and share your vision with the world</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur border">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="font-semibold text-lg mb-2">Find Mentors</h3>
            <p className="text-sm text-gray-600">Connect with companies committed to mentoring underrepresented creators</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur border">
            <div className="text-4xl mb-3">🌟</div>
            <h3 className="font-semibold text-lg mb-2">Build Your Network</h3>
            <p className="text-sm text-gray-600">Connect with creators, backers, and mentors who share your vision</p>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="max-w-5xl mx-auto mb-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-12 text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">For Companies & Organizations</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Showcase your commitment to diversity and social impact while discovering incredible talent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="font-bold text-xl mb-2">Build Your Brand</h3>
            <p className="opacity-90">
              Get recognized for supporting underrepresented creators. Your mentorship impact is showcased to thousands.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">💎</div>
            <h3 className="font-bold text-xl mb-2">Discover Talent</h3>
            <p className="opacity-90">
              Connect with talented creators from diverse backgrounds. Build relationships with future leaders.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="font-bold text-xl mb-2">Track Your Impact</h3>
            <p className="opacity-90">
              Measure mentorship ROI with detailed analytics. Share success stories with stakeholders.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/companies"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-bold text-lg"
          >
            Explore Mentor Companies
          </Link>
        </div>
      </section>

      {/* Why White-Label Section */}
      <section className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">White-Label Platform for Your Brand</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl border border-purple-200 bg-white p-6">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-xl mb-2">Fully Customizable</h3>
            <p className="text-gray-600">
              Match your brand with custom colors, logos, and domains. Create a seamless experience for your community.
            </p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-white p-6">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold text-xl mb-2">Build Connections</h3>
            <p className="text-gray-600">
              Enable networking between creators, mentors, and donors. Foster meaningful relationships that drive success.
            </p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-white p-6">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-bold text-xl mb-2">Showcase Success</h3>
            <p className="text-gray-600">
              Highlight your mentees' achievements. Display testimonials and impact metrics to attract more partnerships.
            </p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-white p-6">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold text-xl mb-2">Enterprise Ready</h3>
            <p className="text-gray-600">
              Secure, scalable infrastructure. Dedicated support for your organization's unique needs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
