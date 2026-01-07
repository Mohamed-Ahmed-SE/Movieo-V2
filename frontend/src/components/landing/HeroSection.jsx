import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const HeroSection = ({ heroMovie, loading }) => {
  const navigate = useNavigate()
  const heroRef = useRef(null)

  useGSAP(() => {
    if (!heroRef.current || loading) return

    const tl = gsap.timeline()
    tl.from('.hero-title', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
    tl.from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')
    tl.from('.hero-buttons', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4')
  }, { scope: heroRef, dependencies: [loading] })

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {heroMovie && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroMovie.backdrop || heroMovie.poster}
            alt={heroMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 animate-pulse" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 py-20">
        <div className="max-w-3xl">
          <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Track Your Favorite
            <span className="block text-primary mt-2">Movies & Shows</span>
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-zinc-400 mb-8 leading-relaxed">
            Create your personalized watchlist, track your progress, and discover new content based on your preferences.
          </p>
          <div className="hero-buttons flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-primary text-black font-bold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-8 py-4 border border-white/30 hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Explore Content
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection

