const SkeletonLoader = ({ className = '' }) => {
  return (
    <div className={`animate-pulse-fast ${className}`}>
      <div className="bg-secondary rounded-lg h-full w-full"></div>
    </div>
  )
}


export const MediaCardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
      <SkeletonLoader className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-2">
        <SkeletonLoader className="h-4 w-3/4" />
        <SkeletonLoader className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export const MediaGridSkeleton = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  )
}


export const HeroSkeleton = () => {
  return (
    <div className="relative h-[100vh] w-full overflow-hidden bg-black animate-pulse-fast">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-secondary/20"></div>

      {/* Content Placeholder */}
      <div className="absolute bottom-0 -translate-y-1/2 left-0 p-6 sm:p-16 w-full max-w-4xl flex flex-col items-start gap-6">
        {/* Title/Logo */}
        <div className="h-24 sm:h-32 w-2/3 sm:w-1/2 bg-secondary/40 rounded-lg"></div>

        {/* Metadata */}
        <div className="flex items-center gap-4">
          <div className="h-6 w-24 bg-secondary/40 rounded"></div>
          <div className="h-6 w-16 bg-secondary/40 rounded"></div>
          <div className="h-6 w-12 bg-secondary/40 rounded"></div>
        </div>

        {/* Description */}
        <div className="space-y-3 w-full max-w-2xl">
          <div className="h-4 w-full bg-secondary/40 rounded"></div>
          <div className="h-4 w-5/6 bg-secondary/40 rounded"></div>
          <div className="h-4 w-4/6 bg-secondary/40 rounded"></div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <div className="h-14 w-40 bg-secondary/40 rounded-lg"></div>
          <div className="h-14 w-40 bg-secondary/40 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

export const CarouselSkeleton = () => {
  return (
    <div className="mb-12 w-full animate-pulse-fast">
      {/* Header */}
      <div className="mb-6 pl-4 sm:pl-6 lg:pl-16">
        <div className="h-8 w-64 bg-secondary/30 rounded mb-2"></div>
        <div className="h-4 w-96 bg-secondary/20 rounded"></div>
      </div>

      {/* Cards */}
      <div className="flex gap-4 overflow-hidden pl-4 sm:pl-6 lg:pl-16">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[280px]">
            <div className="aspect-[2/3] bg-secondary/30 rounded-lg mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-secondary/30 rounded"></div>
              <div className="h-3 w-1/2 bg-secondary/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkeletonLoader

