import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { usePageTransition } from '../hooks/useGSAP'
import { mediaService } from '../services/mediaService'
import HorizontalCarousel from '../components/common/HorizontalCarousel'
import GenreSection from '../components/explore/GenreSection'
import MediaCard from '../components/features/MediaCard'
import { Play, TrendingUp, Star, Sparkles } from 'lucide-react'
import { getMediaImage } from '../utils/mediaHelpers'

const Explore = () => {
  usePageTransition()
  const navigate = useNavigate()
  const { type = 'movie' } = useParams()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userLists = useSelector((state) => state.userLists.lists)

  const [data, setData] = useState({
    hero: null,
    trending: [],
    topRated: [],
    popular: [],
    genreItems: [],
    watchlist: []
  })

  const [loading, setLoading] = useState(true)

  // Configuration for dynamic labels/genres
  const config = useMemo(() => {
    switch (type) {
      case 'anime':
        return {
          label: 'Anime',
          genre1: 'Action',
          tabGenres: ['Action', 'Adventure', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Drama']
        }
      case 'manga':
        return {
          label: 'Manga',
          genre1: 'Fantasy',
          tabGenres: ['Action', 'Adventure', 'Fantasy', 'Romance', 'Drama', 'Horror', 'Mystery', 'Supernatural']
        }
      case 'tv':
        return {
          label: 'Series',
          genre1: 'Drama',
          tabGenres: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Mystery', 'Crime', 'Documentary', 'Family']
        }
      default:
        return {
          label: 'Movies',
          genre1: 'Horror',
          tabGenres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance']
        }
    }
  }, [type])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [trendingRes, topRatedRes, popularRes, genreRes] = await Promise.all([
          mediaService.getTrending(type),
          mediaService.search('top rated', { type }).catch(() => []),
          mediaService.getTrending(type),
          mediaService.search(config.genre1, { type, with_genres: true }).catch(() => [])
        ])

        const trending = Array.isArray(trendingRes) ? trendingRes : (trendingRes?.results || [])
        const topRated = Array.isArray(topRatedRes) ? topRatedRes : (topRatedRes?.results || [])
        const popular = Array.isArray(popularRes) ? popularRes : (popularRes?.results || [])
        const genreItems = Array.isArray(genreRes) ? genreRes : (genreRes?.results || [])

        // Watchlist (if user is logged in)
        let watchlist = []
        if (isAuthenticated && userLists) {
          watchlist = [...(userLists.watching || []), ...(userLists.planned || [])].slice(0, 10)
        }

        setData({
          hero: trending[0] || null,
          trending: trending.slice(1, 15),
          topRated: topRated.slice(0, 15),
          popular: popular.slice(0, 15),
          genreItems: genreItems.slice(0, 15),
          watchlist
        })
      } catch (e) {
        console.error("Explore fetch error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, config, isAuthenticated, userLists])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  const hero = data.hero
  const heroImage = hero ? (getMediaImage(hero, 'backdrop') || getMediaImage(hero, 'poster')) : null
  const heroTitle = hero?.title || hero?.name || 'Explore Content'
  const heroDescription = hero?.overview || hero?.description || ''

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Hero Section - Simplified */}
      {hero && (
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] w-full overflow-hidden mb-12">
          {heroImage ? (
            <img
              src={heroImage}
              alt={heroTitle}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          
          <div className="relative z-10 h-full flex items-end px-4 sm:px-6 lg:px-16 pb-8 sm:pb-12 md:pb-16">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 line-clamp-2 max-w-2xl">
                {heroDescription}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/${hero.type || type}/${hero.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-all hover:scale-105"
                >
                  <Play className="h-5 w-5 fill-black" />
                  Watch Now
                </Link>
                <Link
                  to={`/${hero.type || type}/${hero.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Genre Browser - First Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Browse by Genre
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">Discover {config.label.toLowerCase()} by genre</p>
            </div>
          </div>
          <GenreSection config={config} activeType={type} />
        </div>

        {/* Trending Section */}
        {data.trending.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Trending {config.label}
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base">What's hot right now</p>
              </div>
            </div>
            <HorizontalCarousel
              media={data.trending}
              showArrows={true}
            />
          </div>
        )}

        {/* Top Rated Section */}
        {data.topRated.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Top Rated {config.label}
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base">Highest rated content</p>
              </div>
            </div>
            <HorizontalCarousel
              media={data.topRated}
              showArrows={true}
            />
          </div>
        )}

        {/* Popular Section */}
        {data.popular.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Popular {config.label}
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">Most watched content</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.popular.slice(0, 12).map((item, index) => (
                <MediaCard key={item.id || index} media={item} />
              ))}
            </div>
          </div>
        )}

        {/* Watchlist Section - Only if authenticated */}
        {data.watchlist.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                My Watchlist
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">Continue watching</p>
            </div>
            <HorizontalCarousel
              media={data.watchlist}
              showArrows={true}
            />
          </div>
        )}

        {/* Browse All CTA */}
        <div className="py-12 border-t border-white/10 text-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-all text-base sm:text-lg"
          >
            Browse All {config.label}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Explore
