import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useRef, useState, useEffect, memo, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { gsap } from 'gsap'
import { Play, Bookmark, Plus, Star } from 'lucide-react'
import { normalizeMediaItem, getMediaImage, formatMediaType, getRealMediaType } from '../../utils/mediaHelpers'
import { formatRating } from '../../utils/formatters'
import { useNavigate } from 'react-router-dom'
import MediaCardModal from './MediaCardModal'
import SkeletonLoader from '../common/SkeletonLoader'
import { throttle } from '../../utils/performance'
import { mediaService } from '../../services/mediaService'

const MediaCard = ({ media: rawMedia, listType, isLastCard, onLastCardHover, onLastCardLeave, onCardClick }) => {
  const media = useMemo(() => normalizeMediaItem(rawMedia), [rawMedia])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const containerRef = useRef(null)
  const hoverCardRef = useRef(null)

  // Hover & Portal State
  const [isHovered, setIsHovered] = useState(false)
  const [portalPos, setPortalPos] = useState({ top: 0, left: 0, width: 0, height: 0, alignRight: false, hoverWidth: 0 })
  const hoverTimeout = useRef(null)
  const gsapAnimationRef = useRef(null)
  const isHoveringRef = useRef(false) // Prevent rapid toggling

  const [imageLoaded, setImageLoaded] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [imagesData, setImagesData] = useState(null)
  const customizations = useSelector((state) => state.customization.customizations)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userLists = useSelector((state) => state.userLists.lists)

  const { title, name, id, mediaId, media_type, type, mediaType, vote_average, rating, overview, description, number_of_seasons, number_of_episodes, totalEpisodes, episodes, totalChapters, chapters, episode_run_time, runtime } = media
  const displayTitle = title || name
  const finalId = id || mediaId
  // Use getRealMediaType to ensure Japanese TV shows show as "Anime"
  const finalType = getRealMediaType(media)
  // Get description from normalized media (works for anime too)
  const displayDescription = overview || description || 'No description available.'

  const customization = customizations?.[finalId]
  const displayImage = customization?.customPoster || getMediaImage(media, 'poster')
  // Prioritize backdrop images - try multiple sources for hover card
  const backdropImage = customization?.customBackground ||
    getMediaImage(media, 'backdrop') ||
    (media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : null) ||
    media.bannerImage ||
    media.coverImage?.extraLarge ||
    null
  // For hover card, use backdrop if available, otherwise fallback to poster
  const displayBackdrop = backdropImage || displayImage

  // Fetch images/logo dynamically for hover card
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
        console.error('Error fetching images for MediaCard:', error)
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
    
    // Also check for logo in media object directly
    if (!logoUrl) {
      if (media.logo) {
        setLogoUrl(media.logo)
      } else if (media.logo_path) {
        const logoPath = media.logo_path.startsWith('http') 
          ? media.logo_path 
          : `https://image.tmdb.org/t/p/original${media.logo_path.startsWith('/') ? media.logo_path : `/${media.logo_path}`}`
        setLogoUrl(logoPath)
      }
    }
  }, [finalId, finalType, media.images, media.logo, media.logo_path])

  const allListItems = Object.values(userLists || {}).flat()
  const isInWatchlist = allListItems.some(item => String(item.mediaId) === String(finalId))

  // Get episode/chapter info - prioritize totalEpisodes/totalChapters (from AniList) over number_of_episodes
  const episodeCount = totalEpisodes || episodes || number_of_episodes
  const chapterCount = totalChapters || chapters
  
  const episodeInfo = finalType === 'tv' || finalType === 'anime'
    ? `${number_of_seasons ? `${number_of_seasons} Season${number_of_seasons > 1 ? 's' : ''}` : ''}${number_of_seasons && episodeCount ? ' • ' : ''}${episodeCount ? `${episodeCount} Episode${episodeCount > 1 ? 's' : ''}` : ''}`
    : finalType === 'manga' || finalType === 'manhwa'
      ? chapterCount ? `${chapterCount} Chapter${chapterCount > 1 ? 's' : ''}` : null
      : runtime
        ? `${runtime} min`
        : null

  // Throttled positioning calculation
  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const cardWidth = rect.width
    const hoverCardWidth = cardWidth * 1.2
    const viewportWidth = window.innerWidth
    const scrollX = window.scrollX
    const scrollY = window.scrollY || window.pageYOffset
    const padding = 16
    const maxHoverWidth = viewportWidth - (padding * 2) // Max width to prevent scroll

    let leftPosition = rect.left + scrollX
    let alignRight = false
    let finalHoverWidth = Math.min(hoverCardWidth, maxHoverWidth)

    // Check if card is near the right edge of viewport
    const cardRight = rect.right
    const cardLeft = rect.left
    const distanceFromRight = viewportWidth - cardRight
    const distanceFromLeft = cardLeft

    // For last card or cards near right edge
    if (isLastCard || distanceFromRight < (finalHoverWidth - cardWidth)) {
      // Calculate position to align right edge of hover card with viewport right
      leftPosition = viewportWidth + scrollX - finalHoverWidth - padding
      alignRight = true
      
      // Ensure it doesn't go off left edge
      if (leftPosition < scrollX + padding) {
        leftPosition = scrollX + padding
        // Adjust width if needed to fit
        const availableWidth = viewportWidth - (padding * 2)
        finalHoverWidth = Math.min(finalHoverWidth, availableWidth)
      }
    } else {
      // For other cards, center on the card
      const cardCenterX = rect.left + scrollX + (cardWidth / 2)
      const hoverCardLeft = cardCenterX - (finalHoverWidth / 2)
      const hoverCardRight = cardCenterX + (finalHoverWidth / 2)
      const viewportRight = viewportWidth + scrollX
      const viewportLeft = scrollX

      // If it would go beyond right edge, align to right
      if (hoverCardRight > viewportRight - padding) {
        leftPosition = viewportRight - finalHoverWidth - padding
        alignRight = true
        // Ensure it doesn't go off left edge
        if (leftPosition < viewportLeft + padding) {
          leftPosition = viewportLeft + padding
          finalHoverWidth = Math.min(finalHoverWidth, viewportWidth - (padding * 2))
        }
      } 
      // If it would go off left edge, align to left
      else if (hoverCardLeft < viewportLeft + padding) {
        leftPosition = viewportLeft + padding
        // Adjust width if needed
        const availableWidth = viewportWidth - (padding * 2)
        finalHoverWidth = Math.min(finalHoverWidth, availableWidth)
      } 
      // Center it on the card
      else {
        leftPosition = rect.left + scrollX
      }
    }

    // Final check: ensure hover card never exceeds viewport
    const hoverCardRight = leftPosition + finalHoverWidth
    const viewportRight = viewportWidth + scrollX
    if (hoverCardRight > viewportRight - padding) {
      finalHoverWidth = viewportRight - leftPosition - padding
      if (finalHoverWidth < cardWidth) {
        finalHoverWidth = cardWidth
        leftPosition = viewportRight - finalHoverWidth - padding
        alignRight = true
      }
    }

    // Position hover card so it's centered vertically on the card
    // Position portal container at card's center vertically
    const cardCenterY = rect.top + scrollY + (rect.height / 2)
    
    setPortalPos({
      top: rect.top + scrollY,
      left: leftPosition,
      width: rect.width,
      height: rect.height,
      alignRight,
      hoverWidth: finalHoverWidth
    })
  }, [isLastCard])

  // Check if device supports hover (not mobile/tablet)
  const isHoverSupported = useMemo(() => {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }, [])

  // Optimized hover handler - prevent rapid toggling with throttling
  const handleMouseEnter = useCallback(() => {
    // Disable hover on mobile/tablet
    if (!isHoverSupported) return

    // Clear any pending hide timeout
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
      hoverTimeout.current = null
    }

    // Prevent rapid toggling
    if (isHoveringRef.current) return
    isHoveringRef.current = true

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      if (!containerRef.current) {
        isHoveringRef.current = false
        return
      }

      calculatePosition()

      // Set hovered state - animation will happen in useEffect when ref is ready
      setIsHovered(true)

      // If last card, trigger carousel animation
      if (isLastCard && onLastCardHover) {
        requestAnimationFrame(() => {
          onLastCardHover()
        })
      }
    })
  }, [isLastCard, onLastCardHover, calculatePosition, isHoverSupported])

  const handleMouseLeave = useCallback(() => {
    // Don't hide if already hiding
    if (!isHoveringRef.current && !isHovered) return

    // Clear any pending hover timeout
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }

    if (isLastCard && onLastCardLeave) {
      onLastCardLeave()
    }

    // Use longer delay to prevent flickering
    hoverTimeout.current = setTimeout(() => {
      if (hoverCardRef.current && isHovered) {
        if (gsapAnimationRef.current) {
          gsapAnimationRef.current.kill()
        }

        gsap.to(hoverCardRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 10,
          duration: 0.1,
          ease: 'power2.in',
          onComplete: () => {
            setIsHovered(false)
            isHoveringRef.current = false
          }
        })
      } else {
        setIsHovered(false)
        isHoveringRef.current = false
      }
    }, 50)
  }, [isLastCard, onLastCardLeave, isHovered])

  const handlePortalEnter = useCallback(() => {
    // Clear any pending leave timeout immediately
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
      hoverTimeout.current = null
    }

    // Mark as hovering
    isHoveringRef.current = true

    // Cancel any exit animation and keep visible
    if (gsapAnimationRef.current && hoverCardRef.current) {
      gsapAnimationRef.current.kill()
      gsap.set(hoverCardRef.current, { opacity: 1, scale: 1, y: 0 })
    }

    // Ensure hovered state is true
    if (!isHovered) {
      setIsHovered(true)
    }

    if (isLastCard && onLastCardHover) {
      onLastCardHover()
    }
  }, [isLastCard, onLastCardHover, isHovered])

  const handlePortalLeave = useCallback(() => {
    // Use the same leave handler
    handleMouseLeave()
  }, [handleMouseLeave])

  // Update position on resize and scroll
  useEffect(() => {
    if (!isHovered || !isHoveringRef.current) return

    const throttledUpdate = throttle(() => {
      if (isHovered && containerRef.current && isHoveringRef.current) {
        calculatePosition()
      }
    }, 100)

    window.addEventListener('resize', throttledUpdate, { passive: true })
    window.addEventListener('scroll', throttledUpdate, { passive: true })

    return () => {
      window.removeEventListener('resize', throttledUpdate)
      window.removeEventListener('scroll', throttledUpdate)
    }
  }, [isHovered, calculatePosition])

  // Animate hover card when it becomes available (prevents flickering)
  useEffect(() => {
    if (isHovered && hoverCardRef.current && isHoveringRef.current) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (hoverCardRef.current && isHovered) {
          // Kill any existing animation
          if (gsapAnimationRef.current) {
            gsapAnimationRef.current.kill()
          }

          // Use CSS transforms for better performance where possible
          // Animate hover card in with GSAP
          gsapAnimationRef.current = gsap.fromTo(hoverCardRef.current,
            { opacity: 0, scale: 0.95, y: 10 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.1,
              ease: 'power2.out',
              force3D: true // Force GPU acceleration
            }
          )
        }
      }, 10)

      return () => clearTimeout(timeoutId)
    }
  }, [isHovered])

  // Cleanup GSAP animations on unmount
  useEffect(() => {
    return () => {
      if (gsapAnimationRef.current) {
        gsapAnimationRef.current.kill()
      }
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
      }
    }
  }, [])

  const handleAddToWatchlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowMediaModal(true)
  }

  // Check if mobile/tablet - state to handle resize
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 1024
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Portal Content - Optimized calculation
  const hoverCardWidth = portalPos.hoverWidth || (portalPos.width * 1.2)
  
  const HoverContent = isHovered ? (
    <div
      ref={hoverCardRef}
      className="absolute z-[9999]"
      style={{
        top: `${portalPos.top}px`,
        left: portalPos.alignRight ? 'auto' : `${portalPos.left}px`,
        right: portalPos.alignRight ? '16px' : 'auto',
        width: portalPos.alignRight ? `${hoverCardWidth}px` : `${portalPos.width}px`,
        height: `${portalPos.height}px`,
        opacity: 0, // Start hidden, GSAP will animate
        transform: 'translateZ(0)', // Force GPU acceleration
        willChange: 'transform, opacity',
        maxWidth: 'calc(100vw - 32px)', // Prevent horizontal scroll
        pointerEvents: 'auto'
      }}
      onMouseEnter={handlePortalEnter}
      onMouseLeave={handlePortalLeave}
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 bg-zinc-900 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden origin-center animation-scale-in cursor-pointer border border-zinc-800 ${portalPos.alignRight ? 'right-0' : 'left-1/2 -translate-x-1/2'
          }`}
        style={{
          width: portalPos.alignRight ? `${hoverCardWidth}px` : '120%', // Use calculated width for right-aligned
          height: 'auto', // Auto height adapting to content
          minHeight: '100%',
          maxWidth: '120%' // Ensure it doesn't exceed parent width
        }}
        onClick={(e) => {
          e.preventDefault();
          if (onCardClick) {
            onCardClick(e)
          } else {
            navigate(`/${finalType}/${finalId}`)
          }
        }}
      >
        {/* Top Image Section (Backdrop) */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
          {displayBackdrop ? (
            <img
              src={displayBackdrop}
              alt={displayTitle}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          {/* Gradient overlay at bottom to make logo more visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent pointer-events-none" />
          {/* Logo in bottom left */}
          {logoUrl && (
            <div className="absolute bottom-3 left-3 max-h-16 max-w-[140px] opacity-90 z-10">
              <img
                src={logoUrl}
                alt={`${displayTitle} logo`}
                className="h-full w-full object-contain drop-shadow-lg"
                loading="eager"
              />
            </div>
          )}
          {/* Play Button Overlay - Only on hover-supported devices */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 md:hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
              <Play className="h-6 w-6 fill-white text-white ml-1" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3 bg-zinc-900">
          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCardClick) {
                  onCardClick(e)
                } else {
                  navigate(`/${finalType}/${finalId}`)
                }
              }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center md:hover:bg-gray-200 transition-colors active:bg-gray-300"
              title="Play"
            >
              <Play className="h-4 w-4 fill-black text-black ml-0.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(e) }}
              className="w-8 h-8 rounded-full border-2 border-zinc-500 md:hover:border-white flex items-center justify-center transition-colors group active:border-white"
              title={isInWatchlist ? "Manage in Lists" : "Add to List"}
            >
              <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-orange-500 text-orange-500' : 'text-zinc-300 md:group-hover:text-white'}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCardClick) {
                  onCardClick(e)
                } else {
                  navigate(`/${finalType}/${finalId}`)
                }
              }}
              className="w-8 h-8 rounded-full border-2 border-zinc-500 md:hover:border-white flex items-center justify-center transition-colors ml-auto active:border-white"
              title="More Info"
            >
              <Plus className="h-4 w-4 text-zinc-300 md:hover:text-white" />
            </button>
          </div>

          {/* Title */}
          <h4 className="text-sm font-bold text-white line-clamp-1">
            {displayTitle}
          </h4>

          {/* Metadata - All from same media prop */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-zinc-400">
            <span className="text-green-400">
              {vote_average ? `${Math.round(vote_average * 10)}% Match` : (rating ? `${Math.round(rating * 10)}% Match` : 'New')}
            </span>
            <span className="border border-zinc-600 px-1 rounded text-zinc-300">{media.adult ? '18+' : '13+'}</span>
            <span>
              {episodeInfo ||
                (runtime ? `${runtime} min` : '') ||
                (() => {
                  const date = media.releaseDate || media.release_date || media.first_air_date
                  if (date) {
                    try {
                      return new Date(date).getFullYear()
                    } catch {
                      return 'N/A'
                    }
                  }
                  return 'N/A'
                })()}
            </span>
            <span className="border border-zinc-600 px-1 rounded text-zinc-300 text-[10px]">HD</span>
          </div>

          {/* Description - From same media prop */}
          <p className="text-[10px] text-zinc-300 line-clamp-3 leading-relaxed">
            {displayDescription ? displayDescription.replace(/<[^>]+>/g, '') : 'No description available.'}
          </p>

          {/* Genre Tags - From same media prop */}
          <div className="flex flex-wrap gap-2 text-[10px] text-white">
            <span className="text-zinc-300 capitalize">
              {formatMediaType(finalType)}
            </span>
            {episodeInfo && (
              <>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300">{episodeInfo}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full flex-shrink-0"
        onMouseEnter={isHoverSupported && !isMobile ? handleMouseEnter : undefined}
        onMouseLeave={isHoverSupported && !isMobile ? handleMouseLeave : undefined}
        style={{
          willChange: isHovered ? 'transform' : 'auto',
          contain: 'layout style'
        }}
      >
        {/* Base Card - Always Rendered */}
        {onCardClick ? (
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCardClick(e)
            }}
            className={`block transition-opacity duration-300 cursor-pointer ${isHovered && !isMobile ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="relative">
              {/* Mobile/Tablet List Button - Top Right */}
              {isMobile && isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAddToWatchlist(e)
                  }}
                  className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors"
                  title={isInWatchlist ? "Manage in Lists" : "Add to List"}
                >
                  <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
                </button>
              )}

              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900 rounded-sm">
                {displayImage ? (
                  <>
                    {!imageLoaded && (
                      <SkeletonLoader className="absolute inset-0 h-full w-full z-10" />
                    )}
                    <img
                      src={displayImage}
                      alt={displayTitle}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-xs">No Image</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Below Poster */}
              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {displayTitle}
                </h3>
                <p className="text-xs text-zinc-500">Sub | Dub</p>
              </div>
            </div>
          </div>
        ) : (
          <Link to={`/${finalType}/${finalId}`} className={`block transition-opacity duration-300 ${isHovered && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative">
              {/* Mobile/Tablet List Button - Top Right */}
              {isMobile && isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAddToWatchlist(e)
                  }}
                  className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors"
                  title={isInWatchlist ? "Manage in Lists" : "Add to List"}
                >
                  <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
                </button>
              )}

              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900 rounded-sm">
                {displayImage ? (
                  <>
                    {!imageLoaded && (
                      <SkeletonLoader className="absolute inset-0 h-full w-full z-10" />
                    )}
                    <img
                      src={displayImage}
                      alt={displayTitle}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-xs">No Image</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Below Poster */}
              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {displayTitle}
                </h3>
                <p className="text-xs text-zinc-500">Sub | Dub</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Portal Render - Only when hovered and NOT mobile/tablet */}
      {isHovered && !isMobile && HoverContent && createPortal(HoverContent, document.body)}

      {/* Media Card Modal */}
      <MediaCardModal
        open={showMediaModal}
        onOpenChange={setShowMediaModal}
        media={media}
      />
    </>
  )
}

export default memo(MediaCard, (prevProps, nextProps) => {
  return prevProps.media?.id === nextProps.media?.id && prevProps.listType === nextProps.listType
})
