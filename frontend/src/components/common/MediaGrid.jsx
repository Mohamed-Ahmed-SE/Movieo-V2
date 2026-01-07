import MediaCard from '../features/MediaCard'
import { MediaGridSkeleton } from './SkeletonLoader'
import EmptyState from './EmptyState'
import { Film } from 'lucide-react'

/**
 * Reusable media grid wrapper with loading and empty states
 * Used in: Explore, Search, Watchlist pages
 */
const MediaGrid = ({ 
  media, 
  loading, 
  emptyTitle = 'No results found',
  emptyMessage = 'Try adjusting your filters or search',
  className = '',
  emptyAction
}) => {
  if (loading && (!media || media.length === 0)) {
    return <MediaGridSkeleton />
  }

  if (!loading && (!media || media.length === 0)) {
    return (
      <EmptyState 
        icon={Film}
        title={emptyTitle}
        message={emptyMessage}
        {...emptyAction}
      />
    )
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 ${className}`}>
      {media.map((item, index) => (
        <MediaCard key={`${item.id}-${index}`} media={item} />
      ))}
    </div>
  )
}

export default MediaGrid

