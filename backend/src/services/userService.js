import User from '../models/User.js'
import UserList from '../models/UserList.js'
import UserProgress from '../models/UserProgress.js'

export const userService = {
  getUserProfile: async (userId) => {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return user.toJSON()
  },

  updateProfile: async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    })
    if (!user) {
      throw new Error('User not found')
    }
    return user.toJSON()
  },

  getUserStats: async (userId) => {
    const lists = await UserList.find({ userId })
    const progress = await UserProgress.find({ userId })

    // Calculate category-specific stats
    const animeProgress = progress.filter(p => p.mediaType === 'anime')
    const seriesProgress = progress.filter(p => p.mediaType === 'tv')
    // Merge manga and manhwa into manga category
    const mangaProgress = progress.filter(p => p.mediaType === 'manga' || p.mediaType === 'manhwa')
    const movieLists = lists.filter(l => l.mediaType === 'movie')

    // Count completed movies (including anime movies - anime with no episodes)
    const completedMovies = lists.filter(l => l.mediaType === 'movie' && l.listType === 'completed').length
    const completedAnimeMovies = lists.filter(l => l.mediaType === 'anime' && l.listType === 'completed' && !animeProgress.find(p => p.mediaId === l.mediaId && p.totalEpisodes > 0)).length

    const stats = {
      totalItems: lists.length,
      watching: lists.filter((l) => l.listType === 'watching').length,
      completed: lists.filter((l) => l.listType === 'completed').length,
      planned: lists.filter((l) => l.listType === 'planned').length,
      dropped: lists.filter((l) => l.listType === 'dropped').length,
      onHold: lists.filter((l) => l.listType === 'onHold').length,
      totalEpisodes: progress.reduce((sum, p) => sum + (p.currentEpisode || 0), 0),
      totalMinutes: progress.reduce((sum, p) => sum + (p.watchedMinutes || 0), 0),
      // Category-specific stats
      animeEpisodes: animeProgress.reduce((sum, p) => sum + (p.currentEpisode || 0), 0),
      seriesEpisodes: seriesProgress.reduce((sum, p) => sum + (p.currentEpisode || 0), 0),
      moviesWatched: completedMovies + completedAnimeMovies,
      mangaCompleted: lists.filter(l => (l.mediaType === 'manga' || l.mediaType === 'manhwa') && l.listType === 'completed').length,
    }

    return stats
  },
}


