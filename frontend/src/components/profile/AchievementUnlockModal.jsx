import { memo, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Award, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const RARITY_COLORS = {
  common: { gradient: 'from-zinc-400 to-zinc-600', text: 'text-zinc-300' },
  rare: { gradient: 'from-blue-400 to-blue-600', text: 'text-blue-300' },
  epic: { gradient: 'from-purple-400 to-purple-600', text: 'text-purple-300' },
  legendary: { gradient: 'from-yellow-400 to-amber-600', text: 'text-yellow-300' },
}

const TIER_LABELS = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
}

const AchievementUnlockModal = memo(({ isOpen, onClose, achievement }) => {
  const contentRef = useRef(null)
  const badgeRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const buttonRef = useRef(null)
  const confettiRef = useRef(null)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Reset and animate
      gsap.set([contentRef.current, badgeRef.current, titleRef.current, descRef.current, buttonRef.current], {
        opacity: 0,
        scale: 0.9,
      })

      gsap.set(badgeRef.current, { scale: 0, rotation: -180 })

      const tl = gsap.timeline()

      // Content fade in
      tl.to(contentRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })

      // Badge spring animation
      tl.to(badgeRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      }, '-=0.2')

      // Confetti
      if (confettiRef.current) {
        const confetti = confettiRef.current.children
        confetti.forEach((particle, i) => {
          const angle = (Math.PI * 2 * i) / confetti.length
          const distance = 200 + Math.random() * 100
          const x = Math.cos(angle) * distance
          const y = Math.sin(angle) * distance

          gsap.fromTo(particle, 
            { x: 0, y: 0, opacity: 1, scale: 1 },
            {
              x,
              y,
              opacity: 0,
              scale: 0,
              duration: 1.5,
              delay: Math.random() * 0.5,
              ease: 'power2.out',
            }
          )
        })
      }

      // Title and description
      tl.to([titleRef.current, descRef.current, buttonRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.3')
    }
  }, [isOpen])

  if (!achievement) return null

  const colors = RARITY_COLORS[achievement.rarity || 'common'] || RARITY_COLORS.common
  const tierLabel = TIER_LABELS[achievement.tier] || achievement.tier

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn(
          "fixed inset-0 z-[100] bg-black/95 backdrop-blur-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )} />
        <Dialog.Content className={cn(
          "fixed left-[50%] top-[50%] z-[100] w-[90vw] sm:w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
          "bg-zinc-950 border border-white/10 shadow-2xl p-0 overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        )}>
          <div ref={contentRef} className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
            {/* Confetti Effect */}
            <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
              ))}
            </div>

            {/* Badge */}
            <div
              ref={badgeRef}
              className={cn(
                "w-24 h-24 sm:w-32 sm:h-32 mx-auto flex items-center justify-center",
                `bg-gradient-to-br ${colors.gradient} shadow-2xl`
              )}
            >
              <Award className="h-12 w-12 sm:h-16 sm:w-16 text-black" />
            </div>

            {/* Title */}
            <div ref={titleRef} style={{ opacity: 0, transform: 'translateY(20px)' }}>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Achievement Unlocked!
              </h2>
              <p className={cn("text-lg sm:text-xl font-bold uppercase", colors.text)}>
                {tierLabel} {achievement.category}
              </p>
            </div>

            {/* Description */}
            <p
              ref={descRef}
              style={{ opacity: 0, transform: 'translateY(20px)' }}
              className="text-zinc-400 text-xs sm:text-sm"
            >
              {achievement.description || `You've unlocked the ${tierLabel} achievement for ${achievement.category}!`}
            </p>

            {/* Close Button */}
            <button
              ref={buttonRef}
              style={{ opacity: 0, transform: 'translateY(20px)' }}
              onClick={onClose}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-black font-bold hover:bg-white/90 transition-colors text-sm sm:text-base"
            >
              Awesome!
            </button>
          </div>

          <Dialog.Close
            className={cn(
              "absolute top-3 right-3 sm:top-4 sm:right-4 text-zinc-400 hover:text-white p-1.5 sm:p-2",
              "hover:bg-white/5 transition-all"
            )}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
})

AchievementUnlockModal.displayName = 'AchievementUnlockModal'

export default AchievementUnlockModal
