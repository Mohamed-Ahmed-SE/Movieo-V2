import { useRef, useCallback } from 'react'

/**
 * Custom hook for horizontal scrolling with controls
 * Used in: Home page ContentRow
 * @param {Object} options - Options for scrolling
 * @returns {{ rowRef: RefObject, scroll: Function }}
 */
export const useHorizontalScroll = (options = {}) => {
  const { scrollAmount = 0.5 } = options // 0.5 = half screen width
  const rowRef = useRef(null)

  const scroll = useCallback((direction) => {
    if (rowRef.current) {
      const { current } = rowRef
      const scrollDistance = direction === 'left' 
        ? -current.offsetWidth * scrollAmount 
        : current.offsetWidth * scrollAmount
      current.scrollBy({ 
        left: scrollDistance, 
        behavior: 'smooth' 
      })
    }
  }, [scrollAmount])

  return {
    rowRef,
    scroll,
  }
}

