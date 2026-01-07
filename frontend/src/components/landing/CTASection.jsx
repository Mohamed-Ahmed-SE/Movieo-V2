import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CTASection = () => {
  const navigate = useNavigate()

  return (
    <section className="py-20 container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center fade-in-up">
        <div className="p-12 md:p-16 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 animate-pulse opacity-50" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users tracking their favorite content. Create your free account today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-primary text-black font-bold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/50 text-lg flex items-center gap-2"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-10 py-4 border-2 border-white/30 hover:bg-white/10 transition-all hover:scale-105 text-lg"
              >
                Explore First
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection

