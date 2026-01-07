import { memo } from 'react'
import MediaCard from '../features/MediaCard'
import { cn } from '../../utils/cn'

const TrendingSection = memo(({ media, title = 'Trending Now', subtitle = "Exploding this week" }) => {
  if (!media || media.length === 0) return null

  return (
    <section className="mb-8 sm:mb-12">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1 sm:mb-2">{title}</h2>
        <p className="text-xs sm:text-sm text-zinc-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {media.slice(0, 10).map((item, index) => (
          <div key={item.id || index} className="relative group">
            {/* Rank Badge */}
            <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-primary text-black font-extrabold text-[10px] sm:text-sm rounded-full flex items-center justify-center shadow-lg">
              #{index + 1}
            </div>
            <MediaCard media={item} />
          </div>
        ))}
      </div>
    </section>
  )
})

TrendingSection.displayName = 'TrendingSection'

export default TrendingSection

