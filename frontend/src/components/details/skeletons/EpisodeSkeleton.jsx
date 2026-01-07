import { memo } from 'react'

const EpisodeSkeleton = memo(({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="group relative aspect-video overflow-hidden rounded-xl bg-zinc-900 animate-pulse">
          <div className="absolute inset-0 bg-zinc-800" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="h-3 w-16 bg-zinc-700 rounded mb-2" />
            <div className="h-4 w-full bg-zinc-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
})

EpisodeSkeleton.displayName = 'EpisodeSkeleton'

export default EpisodeSkeleton

