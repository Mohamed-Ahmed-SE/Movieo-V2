import { memo, useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import { cn } from '../../utils/cn'

const HeroSection = memo(({ media, backdropUrl, logoUrl, onPlay, onAddToList, onCustomize, isInList }) => {
  const releaseYear = new Date(media.release_date || media.first_air_date || media.releaseDate).getFullYear() || 'N/A'
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)
  
  // Reset state when logoUrl changes
  useEffect(() => {
    setLogoLoaded(false)
    setLogoError(false)
  }, [logoUrl])
  
  // Timeout to show title if logo takes too long to load (3 seconds)
  useEffect(() => {
    if (logoUrl && !logoLoaded && !logoError) {
      const timeout = setTimeout(() => {
        if (!logoLoaded) {
          setLogoError(true)
        }
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [logoUrl, logoLoaded, logoError])
  
  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <img
        src={backdropUrl}
        alt={media.title || media.name}
        className="hero-img absolute inset-0 w-full h-full object-cover scale-105"
        loading="eager"
      />

      {/* Single Gradient Overlay - Netflix style */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content - Bottom aligned like Netflix */}
      <div className="relative z-10 h-full flex items-end px-4 sm:px-6 lg:px-16 pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6">
          {/* Logo or Title - Logo loads first, title only as fallback */}
          <div className="relative min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px]">
            {logoUrl ? (
              <>
                {/* Logo Image - Preload and show when ready */}
                <img 
                  src={logoUrl} 
                  alt={media.title || media.name}
                  className={`h-20 sm:h-28 md:h-32 lg:h-40 object-contain max-w-full sm:max-w-2xl transition-opacity duration-500 ${
                    logoLoaded ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                  loading="eager"
                  onLoad={() => {
                    setLogoLoaded(true)
                    setLogoError(false)
                  }}
                  onError={() => {
                    setLogoError(true)
                    setLogoLoaded(false)
                  }}
                />
                {/* Title - Only shown if logo fails or times out, hidden until then */}
                {logoError && (
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight">
                    {media.title || media.name}
                  </h1>
                )}
                {/* Loading placeholder - same size as logo to prevent layout shift */}
                {!logoLoaded && !logoError && (
                  <div className="h-20 sm:h-28 md:h-32 lg:h-40 w-full max-w-full sm:max-w-2xl" />
                )}
              </>
            ) : (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight">
                {media.title || media.name}
              </h1>
            )}
          </div>

          {/* Description */}
          <p className="text-zinc-300 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base md:text-lg font-light leading-relaxed">
            {media.overview || media.description}
          </p>

          {/* Action Buttons - Button-first UX */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={onPlay}
              className="flex items-center gap-2 sm:gap-3 bg-white text-black px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 font-bold text-xs sm:text-sm md:text-base hover:bg-white/90 transition-colors"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-black" />
              <span className="hidden sm:inline">{media.type === 'tv' || media.type === 'anime' ? 'Watch Now' : 'Watch Trailer'}</span>
              <span className="sm:hidden">Play</span>
            </button>

            <button
              onClick={onAddToList}
              className={cn(
                "px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 font-semibold transition-colors text-xs sm:text-sm md:text-base",
                isInList
                  ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              {isInList ? 'In List' : 'Add to List'}
            </button>

            <button
              onClick={onCustomize}
              className="px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 bg-white/20 text-white hover:bg-white/30 transition-colors text-xs sm:text-sm md:text-base"
              title="Customize Images"
            >
              Customize
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})

HeroSection.displayName = 'HeroSection'

export default HeroSection

