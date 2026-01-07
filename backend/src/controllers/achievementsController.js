import { achievementsService } from '../services/achievementsService.js'

export const achievementsController = {
  /**
   * Get all achievements for the authenticated user
   */
  getUserAchievements: async (req, res, next) => {
    try {
      const userId = req.user._id
      const achievements = await achievementsService.getUserAchievements(userId)

      res.json({
        success: true,
        data: achievements,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Check and update achievements for the authenticated user
   */
  checkAchievements: async (req, res, next) => {
    try {
      const userId = req.user._id
      const category = req.params.category

      if (category) {
        // Check specific category
        const unlocked = await achievementsService.checkAchievements(userId, category)
        res.json({
          success: true,
          data: unlocked,
          message: `Checked achievements for ${category}`,
        })
      } else {
        // Check all categories
        const unlocked = await achievementsService.checkAllAchievements(userId)
        res.json({
          success: true,
          data: unlocked,
          message: 'Checked all achievements',
        })
      }
    } catch (error) {
      next(error)
    }
  },
}

