import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMediaImage } from '../../utils/mediaHelpers'

const DualColumnSlider = ({ items = [] }) => {
  const leftSliderRef = useRef(null)
  const rightSliderRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!leftSliderRef.current || !rightSliderRef.current || items.length === 0) return

    const leftSlider = leftSliderRef.current
    const rightSlider = rightSliderRef.current
    const cardWidth = 320
    let leftPosition = 0
    let rightPosition = 0

    const duplicatedItems = [...items, ...items]
    const totalWidth = cardWidth * items.length

    const animate = () => {
      if (isPaused) {
        requestAnimationFrame(animate)
        return
      }

      // Left column scrolls left (negative direction)
      leftPosition -= 0.5
      if (Math.abs(leftPosition) >= totalWidth) {
        leftPosition = 0
      }
      leftSlider.style.transform = `translateX(${leftPosition}px)`

      // Right column scrolls right (positive direction)
      rightPosition += 0.5
      if (rightPosition >= totalWidth) {
        rightPosition = 0
      }
      rightSlider.style.transform = `translateX(${rightPosition}px)`

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [items, isPaused])

  if (!items || items.length === 0) return null

  const duplicatedItems = [...items, ...items]

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Scrolls Left */}
          <div
            className="relative overflow-hidden h-[400px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={leftSliderRef}
              className="flex gap-6 h-full"
              style={{ width: 'max-content' }}
            >
              {duplicatedItems.map((item, index) => (
                <Link
                  key={`left-${item.id || item.mediaId}-${index}`}
                  to={`/${item.type || item.mediaType || 'movie'}/${item.id || item.mediaId}`}
                  className="flex-shrink-0 w-[300px] h-full group"
                >
                  <div className="relative w-full h-full overflow-hidden bg-zinc-900 border border-white/10">
                    <img
                      src={getMediaImage(item, 'backdrop') || getMediaImage(item, 'poster')}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title || item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column - Scrolls Right */}
          <div
            className="relative overflow-hidden h-[400px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={rightSliderRef}
              className="flex gap-6 h-full"
              style={{ width: 'max-content' }}
            >
              {duplicatedItems.map((item, index) => (
                <Link
                  key={`right-${item.id || item.mediaId}-${index}`}
                  to={`/${item.type || item.mediaType || 'movie'}/${item.id || item.mediaId}`}
                  className="flex-shrink-0 w-[300px] h-full group"
                >
                  <div className="relative w-full h-full overflow-hidden bg-zinc-900 border border-white/10">
                    <img
                      src={getMediaImage(item, 'backdrop') || getMediaImage(item, 'poster')}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title || item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DualColumnSlider

