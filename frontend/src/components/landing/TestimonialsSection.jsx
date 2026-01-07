import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Movie Enthusiast',
    text: 'Best app for tracking my watchlist! The interface is clean and the recommendations are spot on.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Anime Fan',
    text: 'I\'ve tried many tracking apps, but Movieo is by far the best. Easy to use and feature-rich.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'TV Series Watcher',
    text: 'Perfect for keeping track of multiple series. The progress tracking feature is amazing!',
    rating: 5
  }
]

const TestimonialsSection = () => {
  return (
    <section className="py-20 container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by users worldwide
          </h2>
          <p className="text-lg text-zinc-400">
            Join thousands of satisfied users tracking their favorite content
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="fade-in-up p-8 bg-zinc-900/50 border border-white/5 hover:border-primary/50 transition-all hover:scale-105"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 leading-relaxed text-sm">&quot;{testimonial.text}&quot;</p>
              <div>
                <div className="font-bold text-white">{testimonial.name}</div>
                <div className="text-sm text-zinc-400">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

