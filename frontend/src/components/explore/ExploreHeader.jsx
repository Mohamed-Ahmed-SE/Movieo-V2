import { memo, useState } from 'react'
import { Search } from 'lucide-react'
import GlassCard from '../common/GlassCard'

/**
 * Minimal header with glassmorphism search bar
 */
const ExploreHeader = memo(({ onSearch, searchQuery, setSearchQuery }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="sticky top-20 z-40 mb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search movies, series, anime..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
})

ExploreHeader.displayName = 'ExploreHeader'

export default ExploreHeader

