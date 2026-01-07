import { memo, useRef, useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ExploreBannerCard from './ExploreBannerCard'

/**
 * Reusable section wrapper for explore pages
 * Handles horizontal scrolling with navigation arrows
 * Used for "Today's Top Picks", "Only On Netflix", etc.
 */
const ExploreSection = memo(({ title, subtitle, media = [], className = '' }) => {
  const scrollContainerRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

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

  if (!media || media.length === 0) return null

  return (
    <section className={`mb-8 sm:mb-12 ${className}`}>
      {/* Section Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 sm:mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 sm:w-16 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center justify-start pl-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {media.map((item) => (
            <div
              key={item.id || item.mediaId}
              className="flex-shrink-0 w-full sm:w-[400px] md:w-[450px] lg:w-[500px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ExploreBannerCard media={item} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 sm:w-16 bg-gradient-to-l from-black/90 via-black/50 to-transparent flex items-center justify-end pr-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
          </button>
        )}
      </div>
    </section>
  )
})

ExploreSection.displayName = 'ExploreSection'

export default ExploreSection
