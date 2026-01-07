import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info } from 'lucide-react'
import { normalizeMediaItem, getRealMediaType, getMediaImage } from '../../utils/mediaHelpers'
import { useSelector } from 'react-redux'

/**
 * Hero section for explore pages
 * Left side: Featured content with backdrop
 * Right side: New [Type] sidebar - Designed as a dashboard panel with equal height
 */
const ExploreHero = memo(({ featuredMedia, hotNews = [] }) => {
  const customizations = useSelector((state) => state.customization.customizations)

  if (!featuredMedia) return null

  const media = normalizeMediaItem(featuredMedia)
  const { title, name, id, mediaId, genres, overview, description, releaseDate, release_date, first_air_date } = media
  const displayTitle = title || name
  const finalId = id || mediaId
  const finalType = getRealMediaType(media)
  const displayDescription = overview || description || 'No description available.'

  const customization = customizations?.[finalId]
  const backdropImage = customization?.customBackground ||
    getMediaImage(media, 'backdrop') ||
    (media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : null) ||
    media.bannerImage ||
    media.coverImage?.extraLarge ||
    null

  // Get genres as array
  const genreArray = Array.isArray(genres)
    ? genres.map(g => typeof g === 'string' ? g : g?.name).filter(Boolean).slice(0, 3)
    : []

  return (
    <div className="relative w-full mb-12">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side - Featured Content */}
        <div className="lg:col-span-2 relative h-[450px] sm:h-[550px] md:h-[650px] overflow-hidden bg-zinc-900 shadow-xl rounded-l-xl">
          {backdropImage ? (
            <img
              src={backdropImage}
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <div className="text-4xl opacity-50">🎬</div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tight leading-[0.9] text-balance">
              {displayTitle}
            </h1>

            {/* Genres */}
            {genreArray.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                {genreArray.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-1.5 bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-sm sm:text-lg text-zinc-200 mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl font-medium drop-shadow-md">
              {displayDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to={`/${finalType}/${finalId}`}>
                <button className="px-8 py-4 bg-white text-black font-black text-sm sm:text-base uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 transform hover:scale-105 duration-200 shadow-lg shadow-white/10">
                  <Play className="h-5 w-5 fill-black" />
                  Watch Now
                </button>
              </Link>
              <Link to={`/${finalType}/${finalId}`}>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm sm:text-base uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Details
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - New [Type] Sidebar (Dashboard Style) */}
        <div className="hidden lg:block lg:col-span-1 h-full">
          <div className="h-full bg-zinc-900 flex flex-col p-8 rounded-r-xl shadow-xl border-l border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1.5 bg-[#E50914] rounded-full shadow-[0_0_15px_#E50914]"></div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">New {finalType === 'tv' ? 'Series' : 'Movies'}</h3>
            </div>

            <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
              {hotNews.slice(0, 3).map((item, idx) => {
                const mediaItem = item.relatedMedia || item
                const poster = getMediaImage(mediaItem, 'poster')

                return (
                  <Link key={idx} to={`/${finalType}/${mediaItem.id}`} className="group flex gap-5 items-center p-3 -mx-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                    {/* Large Number */}
                    <span className="text-6xl font-black text-zinc-800 group-hover:text-[#E50914] transition-colors -mb-4 w-12 text-center select-none" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>{idx + 1}</span>

                    {/* Content */}
                    <div className="flex gap-4 flex-1 items-center">
                      <div className="w-20 aspect-[2/3] bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img src={poster} alt={mediaItem.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-white leading-tight mb-1.5 truncate group-hover:text-[#E50914] transition-colors">{mediaItem.title || mediaItem.name}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-2">{mediaItem.overview}</p>
                        <div className="inline-block px-2 py-0.5 border border-zinc-700 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{new Date(mediaItem.release_date || mediaItem.first_air_date).getFullYear() || 'New'}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <Link to="/search?sort=latest" className="mt-auto pt-6 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center justify-between transition-colors border-t border-white/10 group">
              View All Arrivals
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})

ExploreHero.displayName = 'ExploreHero'

export default ExploreHero
