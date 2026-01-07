import { ArrowRight } from 'lucide-react'

const howItWorks = [
  {
    step: '01',
    title: 'Sign Up',
    description: 'Create your free account in seconds. No credit card required.'
  },
  {
    step: '02',
    title: 'Add Content',
    description: 'Search and add your favorite movies, TV shows, and anime to your watchlist.'
  },
  {
    step: '03',
    title: 'Track Progress',
    description: 'Mark episodes as watched, update your progress, and never lose your place.'
  },
  {
    step: '04',
    title: 'Discover More',
    description: 'Get personalized recommendations and explore trending content from the community.'
  }
]

const HowItWorksSection = () => {
  return (
    <section className="py-20 container mx-auto px-6 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Get started in minutes and start tracking your favorite content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div key={index} className="fade-in-up relative">
              <div className="p-8 bg-zinc-900/50 border border-white/5 hover:border-primary/50 transition-all hover:scale-105 group">
                <div className="text-6xl font-black text-primary/20 mb-4 group-hover:text-primary/30 transition-colors">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{step.description}</p>
              </div>
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection

