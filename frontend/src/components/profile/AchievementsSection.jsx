import { memo, useState, useEffect, useRef } from 'react'
import { Trophy, Play, Tv, Film, BookOpen } from 'lucide-react'
import AchievementBadge from './AchievementBadge'
import AchievementUnlockModal from './AchievementUnlockModal'
import { cn } from '../../utils/cn'

const CATEGORY_INFO = {
  anime: { label: 'Anime', icon: Play, unit: 'episodes' },
  series: { label: 'TV Series', icon: Tv, unit: 'episodes' },
  movies: { label: 'Movies', icon: Film, unit: 'movies' },
  animeMovies: { label: 'Anime Movies', icon: Film, unit: 'movies' },
  manga: { label: 'Manga', icon: BookOpen, unit: 'manga' },
}

// Determine rarity based on tier
const getRarity = (tier) => {
  if (tier === 'diamond' || tier === 'platinum') return 'legendary'
  if (tier === 'gold') return 'epic'
  if (tier === 'silver') return 'rare'
  return 'common'
}

const AchievementsSection = memo(({ achievements, onUnlock }) => {
  const [unlockModal, setUnlockModal] = useState({ isOpen: false, achievement: null })
  const [hoveredBadge, setHoveredBadge] = useState(null)

  // Track previous achievements to detect new unlocks
  const prevAchievementsRef = useRef(null)
  
  useEffect(() => {
    if (achievements && prevAchievementsRef.current) {
      Object.entries(achievements).forEach(([category, data]) => {
        data.tiers?.forEach((tier) => {
          if (tier.completed) {
            const prevCategory = prevAchievementsRef.current?.[category]
            const prevTier = prevCategory?.tiers?.find(t => t.tier === tier.tier)
            
            // Check if this is a newly unlocked achievement
            if (!prevTier?.completed && tier.completed && tier.unlockedAt) {
              setUnlockModal({
                isOpen: true,
                achievement: {
                  tier: tier.tier,
                  category: CATEGORY_INFO[category]?.label || category,
                  rarity: tier.rarity || getRarity(tier.tier),
                  description: category === 'manga' 
                    ? `You've completed ${tier.progress} ${CATEGORY_INFO[category]?.unit || 'manga'}!`
                    : category === 'movies' || category === 'animeMovies'
                    ? `You've watched ${tier.progress} ${CATEGORY_INFO[category]?.unit || 'movies'}!`
                    : `You've watched ${tier.progress} ${CATEGORY_INFO[category]?.unit || 'items'}!`,
                },
              })
              if (onUnlock) onUnlock(tier)
            }
          }
        })
      })
    }
    prevAchievementsRef.current = achievements
  }, [achievements, onUnlock])

  if (!achievements) return null

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">Achievements</h3>
      </div>

      {/* Category-based Achievement Groups */}
      {Object.entries(achievements).map(([category, data]) => {
        const categoryInfo = CATEGORY_INFO[category]
        if (!categoryInfo) return null

        const Icon = categoryInfo.icon
        const currentProgress = data.currentProgress || 0

        return (
          <div key={category} className="space-y-3 sm:space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/20">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white capitalize">{categoryInfo.label}</h4>
                  <p className="text-xs text-zinc-400">
                    {currentProgress} {categoryInfo.unit} {category === 'manga' ? 'completed' : category === 'movies' || category === 'animeMovies' ? 'watched' : 'watched'}
                  </p>
                </div>
              </div>
            </div>

            {/* Badge Grid - Filter out achievements with 0 progress */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {data.tiers
                ?.filter((tier) => tier.progress > 0 || tier.completed) // Only show if progress > 0 or already completed
                .map((tier) => {
                  const progressPercent = Math.min((tier.progress / tier.target) * 100, 100)
                  const rarity = tier.rarity || getRarity(tier.tier)
                  const isHidden = false // Can be extended to support hidden achievements

                  return (
                    <AchievementBadge
                      key={tier.tier}
                      tier={tier.tier}
                      unlocked={tier.completed}
                      progressPercent={progressPercent}
                      rarity={rarity}
                      hidden={isHidden}
                      onHover={(hovered) => {
                        if (hovered) {
                          setHoveredBadge({ category, tier: tier.tier })
                        } else {
                          setHoveredBadge(null)
                        }
                      }}
                    />
                  )
                })}
            </div>

            {/* Motivation Copy */}
            {data.tiers?.some(t => !t.completed) && (
              <p className="text-sm text-zinc-400 italic">
                Watch more to unlock rare achievements.
              </p>
            )}
          </div>
        )
      })}

      {/* Unlock Modal */}
      <AchievementUnlockModal
        isOpen={unlockModal.isOpen}
        onClose={() => setUnlockModal({ isOpen: false, achievement: null })}
        achievement={unlockModal.achievement}
      />
    </section>
  )
})

AchievementsSection.displayName = 'AchievementsSection'

export default AchievementsSection

