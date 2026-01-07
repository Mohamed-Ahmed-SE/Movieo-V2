import { memo } from 'react'
import SearchBannerCard from './SearchBannerCard'

/**
 * Reusable section wrapper for search page
 * Static grid layout (no slider)
 * Used for "Today's Top Picks", "Only On Netflix", etc.
 */
const SearchBannerSection = memo(({ title, media = [] }) => {
  if (!media || media.length === 0) return null

  return (
    <section className="mb-8 sm:mb-12">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 sm:mb-2">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {media.map((item, index) => (
          <div key={item.id || item.mediaId || index}>
            <SearchBannerCard 
              media={item} 
              badge={index === 0 ? "ONLY ON NETFLIX" : index === 1 ? "AUG 14 NETFLIX" : null}
            />
          </div>
        ))}
      </div>
    </section>
  )
})

SearchBannerSection.displayName = 'SearchBannerSection'

export default SearchBannerSection
