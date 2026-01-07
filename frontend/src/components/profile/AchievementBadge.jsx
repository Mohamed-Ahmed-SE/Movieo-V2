import { memo, useState, useRef, useEffect } from 'react'
import { Lock, Award } from 'lucide-react'
import { cn } from '../../utils/cn'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const RARITY_COLORS = {
  common: { gradient: 'from-zinc-400 to-zinc-600', glow: 'shadow-zinc-500/50' },
  rare: { gradient: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/50' },
  epic: { gradient: 'from-purple-400 to-purple-600', glow: 'shadow-purple-500/50' },
  legendary: { gradient: 'from-yellow-400 to-amber-600', glow: 'shadow-yellow-500/50' },
}

const TIER_LABELS = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
}

const AchievementBadge = memo(({ 
  tier, 
  unlocked, 
  progressPercent = 0, 
  rarity = 'common',
  hidden = false,
  onHover 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const badgeRef = useRef(null)
  const iconRef = useRef(null)
  const glowRef = useRef(null)
  const progressCircleRef = useRef(null)
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common
  const progress = Math.min(progressPercent, 100)
  const circumference = 2 * Math.PI * 45 // r = 45%

  // Hover animation
  useGSAP(() => {
    if (!badgeRef.current) return

    if (isHovered) {
      gsap.to(badgeRef.current, {
        scale: unlocked ? 1.08 : 1.03,
        duration: 0.3,
        ease: 'power2.out',
      })

      if (unlocked && iconRef.current) {
        gsap.to(iconRef.current, {
          rotate: [0, 10, -10, 0],
          duration: 0.5,
          ease: 'power2.out',
        })
      }

      if (unlocked && glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: [0.5, 1, 0.5],
          duration: 1.5,
          repeat: -1,
          ease: 'power1.inOut',
        })
      }
    } else {
      gsap.to(badgeRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })

      if (iconRef.current) {
        gsap.to(iconRef.current, {
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
      }

      if (glowRef.current) {
        gsap.killTweensOf(glowRef.current)
        gsap.set(glowRef.current, { opacity: 0 })
      }
    }
  }, { scope: badgeRef, dependencies: [isHovered, unlocked] })

  // Progress ring animation
  useGSAP(() => {
    if (!unlocked && progress > 0 && !hidden && progressCircleRef.current) {
      const offset = circumference - (circumference * progress) / 100
      gsap.to(progressCircleRef.current, {
        strokeDashoffset: offset,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
  }, { scope: badgeRef, dependencies: [progress, unlocked, hidden] })

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (onHover) onHover(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (onHover) onHover(false)
  }

  return (
    <div
      ref={badgeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative aspect-square overflow-hidden cursor-pointer transition-all",
        unlocked
          ? `bg-gradient-to-br ${colors.gradient} ${colors.glow} shadow-lg`
          : 'bg-zinc-900 border border-zinc-800'
      )}
    >
      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
          {hidden ? (
            <div className="text-center">
              <Lock className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
              <span className="text-xs text-zinc-500 font-semibold">Hidden</span>
            </div>
          ) : (
            <Lock className="h-8 w-8 text-zinc-500" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center text-center p-4 relative z-0">
        {unlocked ? (
          <>
            <div ref={iconRef}>
              <Award className={cn("h-10 w-10", unlocked ? 'text-black' : 'text-zinc-600')} />
            </div>
            <span className="mt-2 text-xs font-extrabold uppercase text-black">
              {TIER_LABELS[tier] || tier}
            </span>
            {rarity !== 'common' && (
              <span className="mt-1 text-[10px] font-bold uppercase text-black/70">
                {rarity}
              </span>
            )}
          </>
        ) : (
          <>
            <Award className="h-10 w-10 text-zinc-600" />
            <span className="mt-2 text-xs font-extrabold uppercase text-zinc-500">
              {hidden ? '???' : (TIER_LABELS[tier] || tier)}
            </span>
          </>
        )}
      </div>

      {/* Progress Ring - Only show if in progress and not unlocked */}
      {!unlocked && progress > 0 && !hidden && (
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            ref={progressCircleRef}
            cx="50"
            cy="50"
            r="45"
            stroke="white"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="opacity-50"
          />
        </svg>
      )}

      {/* Glow effect when unlocked and hovered */}
      {unlocked && (
        <div
          ref={glowRef}
          className={cn("absolute inset-0 pointer-events-none", colors.glow)}
          style={{ opacity: 0 }}
        />
      )}
    </div>
  )
})

AchievementBadge.displayName = 'AchievementBadge'

export default AchievementBadge
