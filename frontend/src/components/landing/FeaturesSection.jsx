import { Film, Check, TrendingUp, Star, Users, Zap } from 'lucide-react'

const features = [
  {
    icon: Film,
    title: 'Watchlist Management',
    description: 'Organize your favorite movies, TV shows, and anime in one place. Track what you\'re watching, want to watch, or have completed.'
  },
  {
    icon: Check,
    title: 'Progress Tracking',
    description: 'Keep track of episodes, chapters, and viewing progress. Never lose your place in a series again.'
  },
  {
    icon: TrendingUp,
    title: 'Discover New Content',
    description: 'Get personalized recommendations based on your viewing history and preferences. Find your next favorite show or movie.'
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Share your thoughts on what you\'ve watched. Rate movies and shows to help others discover great content.'
  },
  {
    icon: Users,
    title: 'Community Features',
    description: 'Connect with other fans, see what\'s trending, and get recommendations from the community.'
  },
  {
    icon: Zap,
    title: 'Quick Access',
    description: 'Fast and intuitive interface. Find and add content to your watchlist in seconds.'
  }
]

const FeaturesSection = () => {
  return (
    <section className="py-20 container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need
            <span className="block text-primary mt-2">to track your media</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Powerful features to help you organize, track, and discover your favorite content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="fade-in-up group p-8 bg-zinc-900/50 border border-white/5 hover:border-primary/50 hover:bg-zinc-800/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="h-14 w-14 bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:scale-110 transition-all">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection

