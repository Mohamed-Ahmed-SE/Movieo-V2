import { memo } from 'react'

const HeroSkeleton = memo(() => {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black animate-pulse">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-zinc-900" />

      {/* Content Placeholder */}
      <div className="relative z-10 h-full flex items-end px-6 lg:px-16 pb-16">
        <div className="max-w-2xl space-y-6 w-full">
          {/* Title/Logo */}
          <div className="h-28 w-2/3 bg-zinc-800 rounded" />

          {/* Description */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-zinc-800 rounded" />
            <div className="h-4 w-5/6 bg-zinc-800 rounded" />
            <div className="h-4 w-4/6 bg-zinc-800 rounded" />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <div className="h-12 w-40 bg-zinc-800 rounded" />
            <div className="h-12 w-32 bg-zinc-800 rounded" />
            <div className="h-12 w-32 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    </section>
  )
})

HeroSkeleton.displayName = 'HeroSkeleton'

export default HeroSkeleton

