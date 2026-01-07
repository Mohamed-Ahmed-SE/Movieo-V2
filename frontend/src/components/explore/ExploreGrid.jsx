import { memo } from 'react'
import MediaCard from '../features/MediaCard'
import { MediaGridSkeleton } from '../common/SkeletonLoader'

/**
 * Modern responsive grid with MediaCard components
 * Consistent card design across the app
 */
const ExploreGrid = memo(({ items = [], loading = false, className = '' }) => {
  if (loading && items.length === 0) {
    return <MediaGridSkeleton />
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-bold text-white mb-2">No content found</h3>
        <p className="text-zinc-400">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 ${className}`}>
      {items.map((item) => (
        <MediaCard key={item.id || item.mediaId} media={item} />
      ))}
    </div>
  )
})

ExploreGrid.displayName = 'ExploreGrid'

export default ExploreGrid

