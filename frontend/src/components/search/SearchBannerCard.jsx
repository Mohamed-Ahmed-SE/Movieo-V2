import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { normalizeMediaItem, getRealMediaType, getMediaImage } from '../../utils/mediaHelpers'
import { useSelector } from 'react-redux'
import { mediaService } from '../../services/mediaService'

/**
 * Search banner card component - matches "Netflix Search" design exactly
 * Image with logo overlay, followed by metadata row and description below the image.
 */
const SearchBannerCard = memo(({ media: rawMedia, onCardClick }) => {
  const media = normalizeMediaItem(rawMedia)
  const customizations = useSelector((state) => state.customization.customizations)
  const [logoUrl, setLogoUrl] = useState(null)
  const [imagesData, setImagesData] = useState(null)

  // Get genres from both normalized and raw media (in case normalization loses it)
  const genres = media.genres || rawMedia.genres || media.entry?.genres || rawMedia.entry?.genres
  const genre_ids = media.genre_ids || rawMedia.genre_ids
  const entry = media.entry || rawMedia.entry

  const { title, name, id, mediaId, overview, description, runtime, releaseDate, release_date, first_air_date, firstAirDate, episode_run_time, number_of_seasons, number_of_episodes } = media
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

  // Fetch images/logo dynamically
  useEffect(() => {
    const fetchImages = async () => {
      if (!finalId || !finalType) return
      
      try {
        const images = await mediaService.getImages(finalType, finalId)
        if (images) {
          setImagesData(images)
          // Get logo from images
          const logos = images.logos || []
          const logoFromImages = logos.find(l => l.iso_639_1 === 'en') || logos[0]
          
          if (logoFromImages?.fullPath) {
            setLogoUrl(logoFromImages.fullPath)
          } else if (logoFromImages?.file_path) {
            const path = logoFromImages.file_path.startsWith('/') 
              ? logoFromImages.file_path 
              : `/${logoFromImages.file_path}`
            setLogoUrl(`https://image.tmdb.org/t/p/original${path}`)
          }
        }
      } catch (error) {
        console.error('Error fetching images for card:', error)
      }
    }

    // Only fetch if images not already in media object
    if (!media.images && finalId && finalType) {
      fetchImages()
    } else if (media.images) {
      setImagesData(media.images)
      const logoFromImages = media.images?.logos?.find(l => l.iso_639_1 === 'en') || media.images?.logos?.[0]
      if (logoFromImages?.fullPath) {
        setLogoUrl(logoFromImages.fullPath)
      } else if (logoFromImages?.file_path) {
        const path = logoFromImages.file_path.startsWith('/') 
          ? logoFromImages.file_path 
          : `/${logoFromImages.file_path}`
        setLogoUrl(`https://image.tmdb.org/t/p/original${path}`)
      }
    }
  }, [finalId, finalType, media.images])

  // Get year - dynamic from media
  const year = (() => {
    const date = releaseDate || release_date || first_air_date || firstAirDate || media.startDate?.year
    if (date) {
      try {
        if (typeof date === 'number') return date
        return new Date(date).getFullYear()
      } catch {
        return null
      }
    }
    return null
  })()

  // Get genres - dynamic from media
  const genreString = (() => {
    // Try genres array first (check both normalized and raw)
    if (Array.isArray(genres) && genres.length > 0) {
      const firstGenre = genres[0]
      if (typeof firstGenre === 'string') {
        return firstGenre
      }
      if (firstGenre?.name) {
        return firstGenre.name
      }
    }
    
    // Try entry.genres (for AniList data)
    if (entry?.genres && Array.isArray(entry.genres) && entry.genres.length > 0) {
      return entry.genres[0]
    }
    
    // Try rawMedia.genres directly (in case it wasn't normalized)
    if (rawMedia?.genres && Array.isArray(rawMedia.genres) && rawMedia.genres.length > 0) {
      const firstGenre = rawMedia.genres[0]
      if (typeof firstGenre === 'string') {
        return firstGenre
      }
      if (firstGenre?.name) {
        return firstGenre.name
      }
    }
    
    // Try genre_ids if genres array not available
    if (Array.isArray(genre_ids) && genre_ids.length > 0) {
      // Map genre IDs to names (basic mapping)
      const genreMap = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      }
      const mappedGenre = genreMap[genre_ids[0]]
      if (mappedGenre) return mappedGenre
    }
    
    // Fallback based on media type
    if (finalType === 'anime') return 'Anime'
    if (finalType === 'manga' || finalType === 'manhwa') return 'Manga'
    if (finalType === 'tv') return 'TV Series'
    if (finalType === 'movie') return 'Movie'
    
    return 'Entertainment' // Final fallback
  })()

  // Get runtime/duration - dynamic from media
  const duration = (() => {
    // For TV/Anime - show seasons/episodes
    if (finalType === 'tv' || finalType === 'anime') {
      if (number_of_seasons && number_of_episodes) {
        return `${number_of_seasons} Season${number_of_seasons > 1 ? 's' : ''} • ${number_of_episodes} Episode${number_of_episodes > 1 ? 's' : ''}`
      } else if (number_of_seasons) {
        return `${number_of_seasons} Season${number_of_seasons > 1 ? 's' : ''}`
      } else if (number_of_episodes) {
        return `${number_of_episodes} Episode${number_of_episodes > 1 ? 's' : ''}`
      }
      return ''
    }
    // For movies - show runtime
    const movieRuntime = runtime || episode_run_time?.[0] || media.duration
    if (movieRuntime) {
      const hours = Math.floor(movieRuntime / 60)
      const minutes = movieRuntime % 60
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    }
    return ''
  })()

  const handleClick = (e) => {
    if (onCardClick) {
      onCardClick(e)
    }
  }

  return (
    <Link
      to={`/${finalType}/${finalId}`}
      onClick={handleClick}
      className="group block w-full outline-none"
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-900 mb-3 group-hover:ring-4 ring-zinc-700 transition-all duration-300">
        {/* Backdrop Image */}
        {backdropImage ? (
          <img
            src={backdropImage}
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Gradient Overlay - Subtle bottom shade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

        {/* N Logo (Top Left) */}
        <div className="absolute top-0 left-0 p-2">
          <svg viewBox="0 0 22 40" className="h-6 w-auto fill-[#E50914] drop-shadow-md">
            <path d="M1.5 0V40M20.5 0V40M1.5 0L20.5 40" stroke="#E50914" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* Logo on Image (Bottom Left) - Replace title with logo */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-20 left-3 right-3">
          {logoUrl ? (
            <div className="max-h-8 sm:max-h-10 md:max-h-12 max-w-[40%]">
              <img
                src={logoUrl}
                alt={`${displayTitle} logo`}
                className="h-full w-auto object-contain drop-shadow-lg transform transition-transform group-hover:scale-[1.02] origin-bottom-left"
                loading="eager"
              />
            </div>
          ) : (
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg leading-none transform transition-transform group-hover:scale-[1.02] origin-bottom-left">
              {displayTitle}
            </h3>
          )}
        </div>
      </div>

      {/* Metadata Below Image - Dynamic Layout: Genre • Year • Duration • Badge */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center flex-wrap gap-2 text-[13px] font-medium text-zinc-500">
          <span className="text-white font-bold">{genreString}</span>
          <span>•</span>
          {year && (
            <>
              <span>{year}</span>
              <span>•</span>
            </>
          )}
          {duration && (
            <>
              <span>{duration}</span>
              <span>•</span>
            </>
          )}
          <span className="border border-zinc-600 px-1 rounded-[2px] text-[10px] text-zinc-400 font-bold tracking-wider">HD</span>
        </div>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed max-w-[95%]">
          {displayDescription}
        </p>
      </div>
    </Link>
  )
})

SearchBannerCard.displayName = 'SearchBannerCard'

export default SearchBannerCard
