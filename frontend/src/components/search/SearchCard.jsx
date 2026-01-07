import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { normalizeMediaItem, getRealMediaType, getMediaImage } from '../../utils/mediaHelpers'
import { useSelector } from 'react-redux'

/**
 * Compact search card with logo instead of title
 * Reduced height, full width responsive
 */
const SearchCard = memo(({ media: rawMedia }) => {
  const media = normalizeMediaItem(rawMedia)
  const customizations = useSelector((state) => state.customization.customizations)

  const { title, name, id, mediaId } = media
  const displayTitle = title || name
  const finalId = id || mediaId
  const finalType = getRealMediaType(media)

  const customization = customizations?.[finalId]
  const backdropImage = customization?.customBackground ||
    getMediaImage(media, 'backdrop') ||
    (media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : null) ||
    media.bannerImage ||
    media.coverImage?.extraLarge ||
    null

  // Get logo - try multiple sources (matching DetailsPage pattern)
  const imagesData = media.images
  const logoFromImages = imagesData?.logos?.find(l => l.iso_639_1 === 'en') || imagesData?.logos?.[0]
  
  let logoUrl = null
  
  // First, try to get logo from images array
  if (logoFromImages?.fullPath) {
    logoUrl = logoFromImages.fullPath
  } else if (logoFromImages?.file_path) {
    const path = logoFromImages.file_path.startsWith('/') 
      ? logoFromImages.file_path 
      : `/${logoFromImages.file_path}`
    logoUrl = `https://image.tmdb.org/t/p/original${path}`
  }
  
  // Fallback to media.logo or media.logo_path
  if (!logoUrl) {
    if (media.logo) {
      logoUrl = media.logo
    } else if (media.logo_path) {
      logoUrl = media.logo_path.startsWith('http') 
        ? media.logo_path 
        : `https://image.tmdb.org/t/p/original${media.logo_path.startsWith('/') ? media.logo_path : `/${media.logo_path}`}`
    }
  }

  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  return (
    <Link
      to={`/${finalType}/${finalId}`}
      className="group block relative h-[180px] sm:h-[200px] md:h-[220px] overflow-hidden bg-zinc-900 border border-white/10 hover:border-primary/50 transition-all"
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

      {/* Logo or Title */}
      <div className="absolute bottom-4 left-4 right-4">
        {logoUrl && !logoError ? (
          <div className="max-h-12 sm:max-h-14 md:max-h-16 mb-2">
            <img
              src={logoUrl}
              alt={`${displayTitle} logo`}
              className="h-full w-auto max-w-full object-contain opacity-0 transition-opacity duration-300"
              style={{ opacity: logoLoaded ? 1 : 0 }}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoError(true)}
              loading="eager"
            />
          </div>
        ) : (
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
        )}
      </div>
    </Link>
  )
})

SearchCard.displayName = 'SearchCard'

export default SearchCard
