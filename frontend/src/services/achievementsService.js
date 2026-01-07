import api from './api'

export const achievementsService = {
  /**
   * Get all achievements for the authenticated user
   */
  getUserAchievements: async () => {
    const response = await api.get('/achievements')
    return response.data
  },

  /**
   * Check and update achievements
   * @param {string} category - Optional category to check (anime, series, movies, animeMovies, manga, manhwa)
   */
  checkAchievements: async (category = null) => {
    const url = category ? `/achievements/check/${category}` : '/achievements/check'
    const response = await api.post(url)
    return response.data
  },
}

