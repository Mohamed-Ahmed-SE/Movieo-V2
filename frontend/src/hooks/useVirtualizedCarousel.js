import { useState, useEffect, useRef, useCallback } from 'react'
import { createIntersectionObserver } from '../utils/performance'

/**
 * Custom hook for virtualized horizontal carousel
 * Only renders cards in viewport + buffer zone
 */
export const useVirtualizedCarousel = (media, cardWidth = 200, buffer = 2) => {
  const containerRef = useRef(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(buffer * 2, media.length) })
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current || media.length === 0) return

    const container = containerRef.current
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth

    // Calculate which cards are visible
    const startIndex = Math.max(0, Math.floor(scrollLeft / cardWidth) - buffer)
    const endIndex = Math.min(
      media.length - 1,
      Math.ceil((scrollLeft + containerWidth) / cardWidth) + buffer
    )

    setVisibleRange({ start: startIndex, end: endIndex })
    setContainerWidth(containerWidth)
  }, [media.length, cardWidth, buffer])

  // Update visible range on scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateVisibleRange()
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial calculation
    calculateVisibleRange()

    // Handle resize
    const handleResize = () => {
      calculateVisibleRange()
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [calculateVisibleRange])

  // Get visible items
  const visibleItems = media.slice(visibleRange.start, visibleRange.end + 1)
  const startOffset = visibleRange.start * cardWidth

  return {
    containerRef,
    visibleItems,
    visibleRange,
    startOffset,
    containerWidth
  }
}

