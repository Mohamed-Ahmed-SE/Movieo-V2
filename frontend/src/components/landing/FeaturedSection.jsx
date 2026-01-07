import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { mediaService } from '../../services/mediaService'
import { getMediaImage } from '../../utils/mediaHelpers'

const FeaturedSection = () => {
  const navigate = useNavigate()
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [relatedMovies, setRelatedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const movies = await mediaService.getTrending('movie')
        const moviesArray = Array.isArray(movies) ? movies : (movies?.results || [])
        if (moviesArray.length > 0) {
          setFeaturedMovie(moviesArray[0])
          setRelatedMovies(moviesArray.slice(1, 4))
        }
      } catch (error) {
        console.error('Failed to fetch featured movie:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading || !featuredMovie) return null

  const rating = featuredMovie.vote_average ? (featuredMovie.vote_average * 10).toFixed(0) : '80'
  const stars = Math.round((rating / 100) * 5)

  return (
    <section className="relative w-full min-h-[600px] py-20 overflow-hidden">
      {/* Dark background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
      
      {/* Lightning effects background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-1 h-32 bg-yellow-400 opacity-60 blur-sm transform rotate-12" />
        <div className="absolute top-1/3 right-1/3 w-1 h-40 bg-yellow-300 opacity-50 blur-sm transform -rotate-12" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-36 bg-yellow-500 opacity-40 blur-sm transform rotate-45" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Panel - Title, Rating, Synopsis, Play Button */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-black uppercase text-white mb-4 tracking-tight">
                {featuredMovie.title || featuredMovie.name}
              </h2>
              
              {/* Rating with stars */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-white">{rating}%</span>
              </div>

              {/* Synopsis */}
              <p className="text-zinc-300 text-base leading-relaxed mb-6 line-clamp-4">
                {featuredMovie.overview || featuredMovie.description || 'No description available.'}
              </p>

              {/* Play Button */}
              <button
                onClick={() => navigate(`/${featuredMovie.type || 'movie'}/${featuredMovie.id}`)}
                className="px-8 py-4 bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Play className="h-6 w-6 fill-black" />
                Play
              </button>
            </div>
          </div>

          {/* Center - Large Character Image */}
          <div className="lg:col-span-4 relative">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={getMediaImage(featuredMovie, 'poster')}
                alt={featuredMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              {/* Lightning overlay effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/2 w-1 h-full bg-yellow-400 blur-md transform -translate-x-1/2" />
              </div>
            </div>
          </div>

          {/* Right Panel - Three Vertical Thumbnails */}
          <div className="lg:col-span-3 space-y-4">
            {relatedMovies.map((movie, index) => (
              <div
                key={movie.id || index}
                onClick={() => navigate(`/${movie.type || 'movie'}/${movie.id}`)}
                className="relative aspect-[2/3] overflow-hidden bg-zinc-900 border border-white/10 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <img
                  src={getMediaImage(movie, 'poster')}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedSection

