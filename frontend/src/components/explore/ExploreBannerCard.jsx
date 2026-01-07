import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Bookmark, Plus } from 'lucide-react'
import { normalizeMediaItem, getRealMediaType, getMediaImage } from '../../utils/mediaHelpers'
import { useSelector } from 'react-redux'

/**
 * Horizontal banner-style card for explore pages
 * Matches the design from the first photo
 */
const ExploreBannerCard = memo(({ media: rawMedia, onCardClick }) => {
  const media = normalizeMediaItem(rawMedia)
  const customizations = useSelector((state) => state.customization.customizations)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userLists = useSelector((state) => state.userLists.lists)

  const { title, name, id, mediaId, vote_average, rating, overview, description, runtime, releaseDate, release_date, first_air_date, genres } = media
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

  // Get year
  const year = (() => {
    const date = releaseDate || release_date || first_air_date
    if (date) {
      try {
        return new Date(date).getFullYear()
      } catch {
        return null
      }
    }
    return null
  })()

  // Get genres as string
  const genreString = Array.isArray(genres)
    ? genres.map(g => typeof g === 'string' ? g : g?.name).filter(Boolean).slice(0, 3).join(' · ')
    : ''

  // Get rating
  const displayRating = vote_average || rating || 0
  const ratingPercent = Math.round(displayRating * 10)

  // Get runtime/duration
  const duration = runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : null

  // Check if in list
  const allListItems = Object.values(userLists || {}).flat()
  const isInList = allListItems.some(item => String(item.mediaId) === String(finalId))

  const handleClick = (e) => {
    if (onCardClick) {
      onCardClick(e)
    }
  }

  return (
    <Link
      to={`/${finalType}/${finalId}`}
      onClick={handleClick}
      className="group block relative h-[250px] sm:h-[280px] md:h-[300px] overflow-hidden bg-zinc-900 border border-white/10 hover:border-primary/50 transition-all"
    >
      {/* Backdrop Image */}
      {backdropImage ? (
        <img
          src={backdropImage}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <div className="text-4xl opacity-50">🎬</div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        {/* Title */}
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {displayTitle}
        </h3>

        {/* Metadata Row */}
        <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-zinc-300 mb-2">
          {genreString && <span>{genreString}</span>}
          {year && <span>· {year}</span>}
          {duration && <span>· {duration}</span>}
          {displayRating > 0 && <span>· {ratingPercent}% Match</span>}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mb-3">
          {displayDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClick(e)
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-semibold hover:bg-white/90 transition-colors text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-black" />
            <span>WATCH</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors text-xs sm:text-sm flex items-center gap-1.5"
          >
            {isInList ? <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 fill-white" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
          </button>
        </div>
      </div>
    </Link>
  )
})

ExploreBannerCard.displayName = 'ExploreBannerCard'

export default ExploreBannerCard
