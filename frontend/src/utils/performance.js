/**
 * Performance utility functions
 */

/**
 * Debounce function - delays execution until after wait time
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function - limits execution to once per wait time
 */
export const throttle = (func, wait) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), wait)
    }
  }
}

/**
 * RequestAnimationFrame wrapper for smooth animations
 */
export const raf = (callback) => {
  return requestAnimationFrame(callback)
}

/**
 * RequestIdleCallback wrapper with fallback
 */
export const requestIdleCallback = (callback, options = {}) => {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options)
  }
  // Fallback to setTimeout
  return setTimeout(callback, 1)
}

/**
 * Intersection Observer helper
 */
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver(callback, defaultOptions)
}

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (imgElement, src) => {
  if (!imgElement || !src) return

  const observer = createIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgElement.src = src
          imgElement.classList.add('loaded')
          observer.unobserve(imgElement)
        }
      })
    },
    { rootMargin: '50px' }
  )

  observer.observe(imgElement)
  return () => observer.disconnect()
}

