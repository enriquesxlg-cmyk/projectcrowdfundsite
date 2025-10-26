export default function SuccessStoriesPage() {
  const stories = [
    {
      id: 1,
      name: 'Maria Rodriguez',
      project: 'Community Garden Tech Initiative',
      category: 'Environment',
      raised: '$12,500',
      image: null,
      testimonial: "NexaFund gave our community garden the tools we needed to modernize. With smart irrigation sensors and solar panels funded by our supporters, we've reduced water usage by 40% and increased crop yields by 60%. We're now teaching other neighborhoods how to implement sustainable urban farming.",
      impact: [
        '3 community gardens upgraded',
        '150+ families trained',
        '40% reduction in water usage'
      ]
    },
    {
      id: 2,
      name: 'James Chen',
      project: 'Accessible Coding Bootcamp',
      category: 'Education',
      raised: '$28,000',
      image: null,
      testimonial: "As someone with a visual impairment, I struggled to find coding education that was truly accessible. NexaFund helped me create a bootcamp specifically designed for developers with disabilities. We've now graduated 45 students, and 80% have found jobs in tech within 6 months.",
      impact: [
        '45 students graduated',
        '80% job placement rate',
        'Curriculum shared with 12 institutions'
      ]
    },
    {
      id: 3,
      name: 'Amara Okafor',
      project: 'Mental Health App for BIPOC Youth',
      category: 'Healthcare',
      raised: '$35,200',
      image: null,
      testimonial: "The mental health resources available to Black and Indigenous youth were severely lacking culturally appropriate support. NexaFund backers believed in our vision for an app that connects young people with therapists who understand their unique experiences. We've facilitated over 2,000 therapy sessions in just 8 months.",
      impact: [
        '2,000+ therapy sessions',
        '500+ active users',
        'Partnership with 30 culturally-informed therapists'
      ]
    },
    {
      id: 4,
      name: 'David Whitehorse',
      project: 'Indigenous Language Archive',
      category: 'Culture',
      raised: '$18,750',
      image: null,
      testimonial: "Our elders' voices and stories were at risk of being lost forever. Thanks to NexaFund, we digitized over 300 hours of recordings in three Indigenous languages, created educational materials for young people, and launched a mobile app. Our children can now learn their ancestral language anywhere.",
      impact: [
        '300+ hours digitized',
        '5 languages preserved',
        '1,200+ students using the app'
      ]
    },
    {
      id: 5,
      name: 'Sofia Martinez',
      project: 'Refugee Women Tech Training',
      category: 'Social Justice',
      raised: '$22,400',
      image: null,
      testimonial: "NexaFund supporters helped us build a tech training center specifically for refugee women. Many of our students had never used a computer before. Now, they're building websites, creating digital art, and earning income to support their families. This platform gave us more than funding—it gave us hope.",
      impact: [
        '67 women trained',
        '23 now employed in tech',
        'Average income increase of 185%'
      ]
    },
    {
      id: 6,
      name: 'Kai Tanaka',
      project: 'LGBTQ+ Safe Space Maker Lab',
      category: 'Community',
      raised: '$31,000',
      image: null,
      testimonial: "As a queer maker, I wanted to create a space where LGBTQ+ youth could learn electronics, 3D printing, and robotics in an environment where they felt truly safe to be themselves. NexaFund made it possible. We now have 200+ members, and several of our teens have gone on to study engineering at top universities.",
      impact: [
        '200+ active members',
        '15 scholarship recipients',
        'Partnerships with 8 schools'
      ]
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Success Stories
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Real people. Real impact. See how NexaFund has transformed lives and communities.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {stories.map((story, index) => (
          <article
            key={story.id}
            className="bg-white/50 backdrop-blur border rounded-2xl p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                {story.image ? (
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {story.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{story.project}</h2>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">{story.name}</span> • {story.category} • Raised {story.raised}
                </p>
              </div>
            </div>

            <blockquote className="text-gray-700 leading-relaxed mb-6 text-lg italic border-l-4 border-purple-400 pl-4">
              "{story.testimonial}"
            </blockquote>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-purple-900 mb-3">Impact Highlights</h3>
              <ul className="space-y-2">
                {story.impact.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-16 text-center p-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white">
        <h2 className="text-3xl font-bold mb-4">Your Story Could Be Next</h2>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of creators who have brought their visions to life with NexaFund
        </p>
        <a
          href="/campaign/new"
          className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Start Your Campaign
        </a>
      </div>
    </main>
  );
}
