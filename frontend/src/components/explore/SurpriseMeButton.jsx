import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

const SurpriseMeButton = memo(({ onClick, media = [] }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (media.length > 0) {
      const randomItem = media[Math.floor(Math.random() * media.length)]
      navigate(`/${randomItem.type || 'movie'}/${randomItem.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full py-4 sm:py-5 md:py-6 bg-gradient-to-r from-primary/20 to-purple-500/20",
        "border border-primary/30 hover:border-primary/50",
        "text-white font-bold text-base sm:text-lg",
        "flex items-center justify-center gap-2 sm:gap-3",
        "transition-all hover:scale-105 active:scale-95",
        "hover:shadow-lg hover:shadow-primary/20"
      )}
    >
      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
      <span>Surprise Me</span>
    </button>
  )
})

SurpriseMeButton.displayName = 'SurpriseMeButton'

export default SurpriseMeButton

