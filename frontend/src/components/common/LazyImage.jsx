import { useState, useRef, useEffect, memo } from 'react'

/**
 * Optimized image component with lazy loading and intersection observer
 */
const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const containerRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { 
        rootMargin: '50px',
        threshold: 0.01
      }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [isInView])

  // Load image when in view
  useEffect(() => {
    if (isInView && src && imgRef.current) {
      const img = new Image()
      img.onload = () => {
        setIsLoaded(true)
        if (onLoad) onLoad()
      }
      img.onerror = () => {
        setHasError(true)
        if (onError) onError()
      }
      img.src = src
    }
  }, [isInView, src, onLoad, onError])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
          {placeholder || (
            <div className="text-zinc-600 text-xs">Loading...</div>
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <div className="text-zinc-600 text-xs">Failed to load</div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={isLoaded ? src : undefined}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

export default LazyImage

