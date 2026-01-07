import { memo, useState } from 'react'
import { cn } from '../../utils/cn'

const VIBES = [
  { id: 'trending', label: '🔥 Trending', emoji: '🔥' },
  { id: 'chill', label: '😌 Chill', emoji: '😌' },
  { id: 'dark', label: '😱 Dark', emoji: '😱' },
  { id: 'action', label: '💥 Action', emoji: '💥' },
  { id: 'romance', label: '💕 Romance', emoji: '💕' },
  { id: 'mind-bending', label: '🧠 Mind-Bending', emoji: '🧠' },
]

const VibeChips = memo(({ selectedVibe, onVibeChange }) => {
  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 sm:pb-4 px-1">
      {VIBES.map((vibe) => (
        <button
          key={vibe.id}
          onClick={() => onVibeChange(selectedVibe === vibe.id ? null : vibe.id)}
          className={cn(
            "px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-all",
            "hover:scale-105 active:scale-95",
            selectedVibe === vibe.id
              ? "bg-primary text-black shadow-lg shadow-primary/30"
              : "bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/10"
          )}
        >
          {vibe.label}
        </button>
      ))}
    </div>
  )
})

VibeChips.displayName = 'VibeChips'

export default VibeChips

