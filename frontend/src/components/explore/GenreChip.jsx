import { memo } from 'react'
import { cn } from '../../utils/cn'

// Genre color mapping
const genreColors = {
  Action: 'bg-red-500 hover:bg-red-600',
  Adventure: 'bg-orange-500 hover:bg-orange-600',
  Animation: 'bg-pink-500 hover:bg-pink-600',
  Comedy: 'bg-yellow-500 hover:bg-yellow-600',
  Crime: 'bg-zinc-700 hover:bg-zinc-600',
  Drama: 'bg-blue-500 hover:bg-blue-600',
  Fantasy: 'bg-purple-500 hover:bg-purple-600',
  Horror: 'bg-red-700 hover:bg-red-800',
  Mystery: 'bg-indigo-500 hover:bg-indigo-600',
  Romance: 'bg-pink-500 hover:bg-pink-600',
  'Sci-Fi': 'bg-cyan-500 hover:bg-cyan-600',
  'SciFi': 'bg-cyan-500 hover:bg-cyan-600',
  Thriller: 'bg-violet-500 hover:bg-violet-600',
  Western: 'bg-amber-600 hover:bg-amber-700',
  'Slice of Life': 'bg-green-500 hover:bg-green-600',
  Sports: 'bg-emerald-500 hover:bg-emerald-600',
  Supernatural: 'bg-purple-600 hover:bg-purple-700',
  Manhwa: 'bg-teal-500 hover:bg-teal-600',
}

const GenreChip = ({ genre, isActive = false, onClick, className = '' }) => {
  const colorClass = genreColors[genre] || 'bg-primary hover:bg-primary/80'
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-bold text-white transition-all rounded",
        isActive 
          ? cn(colorClass, "shadow-lg shadow-current/50 scale-105")
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white',
        className
      )}
    >
      {genre}
    </button>
  )
}

export default memo(GenreChip)

