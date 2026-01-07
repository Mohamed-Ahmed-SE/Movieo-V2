import Achievement from '../models/Achievement.js'
import UserList from '../models/UserList.js'
import UserProgress from '../models/UserProgress.js'

// Achievement tier definitions
const ACHIEVEMENT_TIERS = {
  anime: [
    { tier: 'bronze', target: 10 },
    { tier: 'silver', target: 50 },
    { tier: 'gold', target: 100 },
    { tier: 'platinum', target: 500 },
    { tier: 'diamond', target: 1000 },
  ],
  series: [
    { tier: 'bronze', target: 50 },
    { tier: 'silver', target: 100 },
    { tier: 'gold', target: 500 },
    { tier: 'platinum', target: 1000 },
  ],
  movies: [
    { tier: 'bronze', target: 10 },
    { tier: 'silver', target: 50 },
    { tier: 'gold', target: 100 },
    { tier: 'platinum', target: 500 },
  ],
  animeMovies: [
    { tier: 'bronze', target: 5 },
    { tier: 'silver', target: 10 },
    { tier: 'gold', target: 25 },
    { tier: 'platinum', target: 50 },
  ],
  manga: [
    { tier: 'bronze', target: 5 },
    { tier: 'silver', target: 25 },
    { tier: 'gold', target: 50 },
    { tier: 'platinum', target: 100 },
    { tier: 'diamond', target: 250 },
  ],
  // Note: manhwa has been merged into manga category
}

/**
 * Calculate current progress for a category
 * Optimized with targeted queries instead of fetching all data
 */
const calculateProgress = async (userId, category) => {
  switch (category) {
    case 'anime': {
      const progress = await UserProgress.find({ userId, mediaType: 'anime' })
      return progress.reduce((sum, p) => sum + (p.currentEpisode || 0), 0)
    }
    case 'series': {
      const progress = await UserProgress.find({ userId, mediaType: 'tv' })
      return progress.reduce((sum, p) => sum + (p.currentEpisode || 0), 0)
    }
    case 'movies': {
      const count = await UserList.countDocuments({ 
        userId, 
        mediaType: 'movie', 
        listType: 'completed' 
      })
      return count
    }
    case 'animeMovies': {
      // Get all completed anime
      const completedAnime = await UserList.find({ 
        userId, 
        mediaType: 'anime', 
        listType: 'completed' 
      })
      // Get all anime progress with episodes
      const animeProgress = await UserProgress.find({ 
        userId, 
        mediaType: 'anime',
        totalEpisodes: { $gt: 0 }
      })
      const progressMediaIds = new Set(animeProgress.map(p => String(p.mediaId)))
      // Count anime without episodes (movies)
      return completedAnime.filter(l => !progressMediaIds.has(String(l.mediaId))).length
    }
    case 'manga': {
      // Include both manga and manhwa in manga category
      const count = await UserList.countDocuments({ 
        userId, 
        mediaType: { $in: ['manga', 'manhwa'] }, 
        listType: 'completed' 
      })
      return count
    }
    default:
      return 0
  }
}

/**
 * Check and update achievements for a specific category
 * Optimized to batch database operations
 */
const checkAchievements = async (userId, category) => {
  const tiers = ACHIEVEMENT_TIERS[category]
  if (!tiers) return []

  const currentProgress = await calculateProgress(userId, category)
  const unlockedAchievements = []

  // Batch fetch all existing achievements for this category
  const existingAchievements = await Achievement.find({ userId, category })
  const achievementMap = new Map(
    existingAchievements.map(a => [`${a.category}-${a.tier}`, a])
  )

  // Process achievements and collect operations
  const achievementsToProcess = []

  for (const { tier, target } of tiers) {
    const key = `${category}-${tier}`
    let achievement = achievementMap.get(key)

    if (!achievement) {
      // Create new achievement
      achievement = await Achievement.create({
        userId,
        category,
        tier,
        progress: currentProgress,
        target,
        completed: currentProgress >= target,
        unlockedAt: currentProgress >= target ? new Date() : null,
      })
    } else {
      // Update existing achievement
      const needsUpdate = achievement.progress !== currentProgress || 
                         (!achievement.completed && currentProgress >= target)
      
      if (needsUpdate) {
        achievement.progress = currentProgress
        if (!achievement.completed && currentProgress >= target) {
          achievement.completed = true
          achievement.unlockedAt = new Date()
        }
        await achievement.save()
      }
    }

    if (achievement.completed) {
      unlockedAchievements.push(achievement)
    }
  }

  return unlockedAchievements
}

/**
 * Check and update all achievements for a user
 */
const checkAllAchievements = async (userId) => {
  const categories = Object.keys(ACHIEVEMENT_TIERS)
  const allUnlocked = []

  for (const category of categories) {
    const unlocked = await checkAchievements(userId, category)
    allUnlocked.push(...unlocked)
  }

  return allUnlocked
}

/**
 * Get all achievements for a user with progress
 */
const getUserAchievements = async (userId) => {
  const categories = Object.keys(ACHIEVEMENT_TIERS)
  const achievements = {}

  // Initialize all categories with their tiers
  for (const category of categories) {
    const tiers = ACHIEVEMENT_TIERS[category]
    const currentProgress = await calculateProgress(userId, category)

    achievements[category] = {
      currentProgress,
      tiers: await Promise.all(
        tiers.map(async ({ tier, target }) => {
          let achievement = await Achievement.findOne({ userId, category, tier })

          if (!achievement) {
            // Create if doesn't exist
            achievement = await Achievement.create({
              userId,
              category,
              tier,
              progress: currentProgress,
              target,
              completed: currentProgress >= target,
              unlockedAt: currentProgress >= target ? new Date() : null,
            })
          } else {
            // Update progress
            achievement.progress = currentProgress
            if (!achievement.completed && currentProgress >= target) {
              achievement.completed = true
              achievement.unlockedAt = new Date()
            }
            await achievement.save()
          }

          // Determine rarity based on tier
          const getRarity = (tier) => {
            if (tier === 'diamond' || tier === 'platinum') return 'legendary'
            if (tier === 'gold') return 'epic'
            if (tier === 'silver') return 'rare'
            return 'common'
          }

          return {
            tier,
            target,
            progress: achievement.progress,
            completed: achievement.completed,
            unlockedAt: achievement.unlockedAt,
            rarity: getRarity(tier),
          }
        })
      ),
    }
  }

  return achievements
}

export const achievementsService = {
  checkAchievements,
  checkAllAchievements,
  getUserAchievements,
  calculateProgress,
  ACHIEVEMENT_TIERS,
}

