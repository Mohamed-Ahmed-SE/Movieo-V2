import { useRef, useState, useEffect, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MediaCard from '../features/MediaCard'
import { gsap } from 'gsap'

const HorizontalCarousel = ({
  title,
  subtitle,
  media = [],
  linkTo,
  linkLabel = 'View All',
  showArrows = true,
  autoScroll = false,
  className = ''
}) => {
  const scrollContainerRef = useRef(null)
  const cardRefs = useRef([])
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const gsapAnimationRef = useRef(null)

  // Touch drag state for mobile/tablet
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef(null)

  // Debounced scroll handler for performance
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  // Debounce scroll events for better performance
  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (!container) return

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScrollButtons()
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [checkScrollButtons])


  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || !scrollContainerRef.current) return

    const container = scrollContainerRef.current
    let scrollInterval

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          container.scrollBy({ left: 1, behavior: 'smooth' })
        }
      }, 50) // Adjust speed as needed
    }

    const pauseAutoScroll = () => {
      clearInterval(scrollInterval)
    }

    container.addEventListener('mouseenter', pauseAutoScroll)
    container.addEventListener('mouseleave', startAutoScroll)

    startAutoScroll()

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener('mouseenter', pauseAutoScroll)
      container.removeEventListener('mouseleave', startAutoScroll)
    }
  }, [autoScroll, media])

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.75
    const targetScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  // Handle last card hover - move adjacent card with GSAP (memoized)
  const handleLastCardHover = useCallback(() => {
    if (media.length < 2) return
    
    // Kill any existing animation
    if (gsapAnimationRef.current) {
      gsapAnimationRef.current.kill()
    }
    
    // Get the second-to-last card
    const secondLastCardIndex = media.length - 2
    const secondLastCard = cardRefs.current[secondLastCardIndex]
    
    if (secondLastCard) {
      // Animate with GSAP
      gsapAnimationRef.current = gsap.to(secondLastCard, {
        x: 120,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
  }, [media.length])

  // Handle last card hover leave - return adjacent card back with GSAP (memoized)
  const handleLastCardLeave = useCallback(() => {
    if (media.length < 2) return
    
    // Kill any existing animation
    if (gsapAnimationRef.current) {
      gsapAnimationRef.current.kill()
    }
    
    // Get the second-to-last card
    const secondLastCardIndex = media.length - 2
    const secondLastCard = cardRefs.current[secondLastCardIndex]
    
    if (secondLastCard) {
      // Animate back with GSAP
      gsapAnimationRef.current = gsap.to(secondLastCard, {
        x: 0,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
  }, [media.length])
  
  // Cleanup GSAP animations on unmount
  useEffect(() => {
    return () => {
      if (gsapAnimationRef.current) {
        gsapAnimationRef.current.kill()
      }
    }
  }, [])

  // Touch drag handlers for mobile/tablet
  const handleTouchStart = useCallback((e) => {
    if (!scrollContainerRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    setIsDragging(true)
    dragStartRef.current = {
      x: touch.pageX,
      scrollLeft: scrollContainerRef.current.scrollLeft
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current || !dragStartRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    e.preventDefault()
    e.stopPropagation()
    const walk = (touch.pageX - dragStartRef.current.x) * 2 // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  // Mouse drag handlers for tablet (with mouse)
  const handleMouseDown = useCallback((e) => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: scrollContainerRef.current.scrollLeft
    }
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return
    if (!isDragging || !scrollContainerRef.current || !dragStartRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const walk = (e.pageX - dragStartRef.current.x) * 2
    scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  // Attach drag handlers
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || typeof window === 'undefined') return

    let isMobile = window.innerWidth < 1024

    // Touch events for mobile/tablet - always attach
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Mouse events for tablet - only on mobile/tablet
    if (isMobile) {
      container.addEventListener('mousedown', handleMouseDown, { passive: false })
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp, { passive: true })
    }

    const handleResize = () => {
      const wasMobile = isMobile
      isMobile = window.innerWidth < 1024
      
      // Add/remove mouse handlers based on screen size
      if (isMobile && !wasMobile) {
        container.addEventListener('mousedown', handleMouseDown, { passive: false })
        window.addEventListener('mousemove', handleMouseMove, { passive: false })
        window.addEventListener('mouseup', handleMouseUp, { passive: true })
      } else if (!isMobile && wasMobile) {
        container.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp])

  if (!media || media.length === 0) return null

  return (
    <section className={`mb-12 w-full ${className}`}>
      {/* Section Header - Aligned to same left margin */}
      <div className=" -mb-6">
        <div className="flex items-center justify-between mr-12">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[0.9] mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
          {linkTo && (
            <Link
              to={linkTo}
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mb-2"
            >
              {linkLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Full Width Content Container with Arrows - Extends to screen edge */}
      <div className="relative group w-full">
        {/* Left Arrow - Gradient background with hover effect */}
        {showArrows && showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 sm:w-16 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center justify-start pl-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:w-20"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-10 w-10 transition-transform hover:scale-125 duration-300" />
          </button>
        )}

        {/* Scrollable Content - Full width to screen edge, cards start from same line as title */}
        <div className="relative w-full" style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pl-6 sm:pl-9 lg:pl-16 py-12 scroll-smooth w-full select-none"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              overflowY: 'visible',
              willChange: 'scroll-position',
              transform: 'translateZ(0)', // Force GPU acceleration
              cursor: isDragging ? 'grabbing' : (typeof window !== 'undefined' && window.innerWidth < 1024 ? 'grab' : 'default'),
              userSelect: 'none',
              touchAction: 'pan-x',
              WebkitUserSelect: 'none'
            }}
          >
            {media.map((item, index) => {
              const isLastCard = index === media.length - 1
              const isSecondLast = index === media.length - 2
              return (
                <div
                  key={item.id || item.mediaId || index}
                  className={`flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[280px] ${
                    isSecondLast ? 'transition-transform duration-300 ease-out' : ''
                  }`}
                  style={{ 
                    scrollSnapAlign: 'start', 
                    overflow: 'visible',
                    transform: 'translateX(0)'
                  }}
                >
                  <MediaCard 
                    media={item} 
                    isLastCard={isLastCard}
                    onLastCardHover={isLastCard ? handleLastCardHover : undefined}
                    onLastCardLeave={isLastCard ? handleLastCardLeave : undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Arrow - Gradient background with hover effect */}
        {showArrows && showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 sm:w-16 bg-gradient-to-l from-black/90 via-black/50 to-transparent flex items-center justify-end pr-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:w-20"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-10 w-10 transition-transform hover:scale-125 duration-300" />
          </button>
        )}
      </div>
    </section>
  )
}

// Optimized memo comparison - only re-render if props actually change
export default memo(HorizontalCarousel, (prevProps, nextProps) => {
  // Check if media array reference changed or content changed
  if (prevProps.media?.length !== nextProps.media?.length) return false
  
  // Deep comparison only if lengths match
  if (prevProps.media && nextProps.media) {
    for (let i = 0; i < prevProps.media.length; i++) {
      if (prevProps.media[i]?.id !== nextProps.media[i]?.id) {
        return false
      }
    }
  }
  
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.linkTo === nextProps.linkTo &&
    prevProps.linkLabel === nextProps.linkLabel
  )
})

