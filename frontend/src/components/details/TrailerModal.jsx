import { memo } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const TrailerModal = memo(({ isOpen, trailerKey, onClose }) => {
  if (!isOpen || !trailerKey) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/90 backdrop-blur-lg p-2 sm:p-4 pt-8 sm:pt-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl aspect-video bg-black overflow-hidden shadow-2xl rounded-lg sm:rounded-xl mt-4 sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
          title="Trailer"
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <button
          className={cn(
            "absolute top-2 right-2 sm:top-4 sm:right-4",
            "text-white bg-black/80 hover:bg-black/95",
            "p-2.5 sm:p-3",
            "transition-all duration-200",
            "backdrop-blur-sm rounded-full",
            "border border-white/20",
            "hover:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black",
            "group"
          )}
          onClick={onClose}
          aria-label="Close trailer"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
  )
})

TrailerModal.displayName = 'TrailerModal'

export default TrailerModal

