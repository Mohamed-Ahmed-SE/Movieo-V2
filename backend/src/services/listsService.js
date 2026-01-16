import UserList from '../models/UserList.js'
import UserProgress from '../models/UserProgress.js'
import { mediaService } from './mediaService.js'
import { achievementsService } from './achievementsService.js'

export const listsService = {
  getUserLists: async (userId) => {
    const lists = await UserList.find({ userId })
    const progress = await UserProgress.find({ userId })

    const grouped = {
      watching: [],
      completed: [],
      planned: [],
      dropped: [],
      onHold: [],
    }

    // Fetch missing title/description and re-check mediaType for items (backward compatibility)
    const itemsWithDetails = await Promise.all(
      lists.map(async (item) => {
        const itemJson = item.toJSON()
        let needsUpdate = false

        // Re-check mediaType if we have language/origin info or need to fetch details
        if (item.original_language || item.origin_country?.length > 0 || !itemJson.title) {
          let detectedType = item.mediaType

          // If we have stored language info, use it to re-check
          if (item.original_language || item.origin_country?.length > 0) {
            const isJapanese = item.original_language === 'ja' ||
              (item.origin_country && (item.origin_country.includes('JP') || item.origin_country === 'JP'))

            if (item.mediaType === 'tv' && isJapanese) {
              detectedType = 'anime'
            } else if (item.mediaType === 'manga') {
              const isKorean = item.original_language === 'ko' ||
                (item.origin_country && (item.origin_country.includes('KR') || item.origin_country === 'KR'))
              if (isKorean) {
                detectedType = 'manhwa'
              }
            }
          }

          // If title/description is missing or type needs correction, fetch from media service
          if (!itemJson.title && !itemJson.name || detectedType !== item.mediaType) {
            try {
              const mediaDetails = await mediaService.getDetails(item.mediaType, item.mediaId)
              itemJson.title = mediaDetails.title || mediaDetails.name || itemJson.title || null
              itemJson.name = mediaDetails.name || mediaDetails.title || itemJson.name || null
              itemJson.overview = mediaDetails.overview || mediaDetails.description || itemJson.overview || null
              itemJson.description = mediaDetails.description || mediaDetails.overview || itemJson.description || null

              // Re-check type with fresh data
              const originalLanguage = mediaDetails.original_language || mediaDetails.originalLanguage
              const originCountry = mediaDetails.origin_country || mediaDetails.countryOfOrigin || []

              const isJapanese = originalLanguage === 'ja' ||
                (Array.isArray(originCountry) ? originCountry.includes('JP') : originCountry === 'JP')

              if (item.mediaType === 'tv' && isJapanese) {
                detectedType = 'anime'
              } else if (item.mediaType === 'manga') {
                const isKorean = originalLanguage === 'ko' ||
                  (Array.isArray(originCountry) ? originCountry.includes('KR') : originCountry === 'KR')
                if (isKorean) {
                  detectedType = 'manhwa'
                }
              }

              // Update the database for future requests
              item.title = itemJson.title
              item.name = itemJson.name
              item.overview = itemJson.overview
              item.description = itemJson.description
              if (detectedType !== item.mediaType) {
                item.mediaType = detectedType
                itemJson.mediaType = detectedType
                needsUpdate = true

                // Update UserProgress records with the new mediaType
                const oldType = item.mediaType
                await UserProgress.updateMany(
                  { userId: item.userId.toString(), mediaId: item.mediaId, mediaType: oldType },
                  { $set: { mediaType: detectedType } }
                )
              }
              if (originalLanguage && !item.original_language) {
                item.original_language = originalLanguage
              }
              if (originCountry && (!item.origin_country || item.origin_country.length === 0)) {
                item.origin_country = Array.isArray(originCountry) ? originCountry : [originCountry]
              }
              if (needsUpdate || !itemJson.title) {
                await item.save()
              }
            } catch (error) {
              // If fetch fails, continue with existing data
              console.error(`Error fetching details for ${item.mediaType}/${item.mediaId}:`, error.message)
            }
          } else if (detectedType !== item.mediaType) {
            // Update type if we detected a change from stored language info
            item.mediaType = detectedType
            itemJson.mediaType = detectedType

            // Update UserProgress records with the new mediaType
            const oldType = item.mediaType
            await UserProgress.updateMany(
              { userId: item.userId.toString(), mediaId: item.mediaId, mediaType: oldType },
              { $set: { mediaType: detectedType } }
            )

            await item.save()
          }
        }

        return itemJson
      })
    )

    itemsWithDetails.forEach((item) => {
      const progressData = progress.find(
        (p) => p.mediaId === item.mediaId && p.mediaType === item.mediaType
      )
      grouped[item.listType].push({
        ...item,
        progress: progressData?.toJSON() || null,
      })
    })

    return grouped
  },

  addToList: async (userId, listData) => {
    let { mediaId, mediaType, listType, rating, notes } = listData

    // First, try to find existing item with the initial mediaType
    let existing = await UserList.findOne({
      userId,
      mediaId,
      mediaType,
    })

    // If not found, try with other possible types (for backward compatibility)
    if (!existing) {
      const possibleTypes = mediaType === 'manhwa' ? ['manga'] :
        mediaType === 'manga' ? ['manhwa'] :
          mediaType === 'anime' ? ['tv'] :
            mediaType === 'tv' ? ['anime'] : []
      for (const altType of possibleTypes) {
        existing = await UserList.findOne({
          userId,
          mediaId,
          mediaType: altType,
        })
        if (existing) break
      }
    }

    // Fetch media details to get poster/backdrop and episode/chapter info
    let posterUrl = null
    let backdropUrl = null
    let totalEpisodes = null
    let title = null
    let name = null
    let overview = null
    let description = null
    let originalLanguage = null
    let originCountry = []

    try {
      const mediaDetails = await mediaService.getDetails(mediaType, mediaId)
      posterUrl = mediaDetails.poster || mediaDetails.poster_path || null
      backdropUrl = mediaDetails.backdrop || mediaDetails.backdrop_path || null

      // Get title/name and description
      title = mediaDetails.title || mediaDetails.name || null
      name = mediaDetails.name || mediaDetails.title || null
      overview = mediaDetails.overview || mediaDetails.description || null
      description = mediaDetails.description || mediaDetails.overview || null

      // Get language and origin for type detection
      originalLanguage = mediaDetails.original_language || mediaDetails.originalLanguage || null
      originCountry = mediaDetails.origin_country || mediaDetails.countryOfOrigin || []

      // Re-check media type based on language/origin (important for manhwa/anime detection)
      // IMPORTANT: Only TV series with Japanese become anime, NOT movies
      let detectedType = mediaType
      const isJapanese = originalLanguage === 'ja' ||
        (Array.isArray(originCountry) ? originCountry.includes('JP') : originCountry === 'JP')

      if (mediaType === 'tv' && isJapanese) {
        detectedType = 'anime'
      } else if (mediaType === 'movie') {
        // Movies always stay as movies, regardless of language
        detectedType = 'movie'
      } else if (mediaType === 'manga') {
        const isKorean = originalLanguage === 'ko' ||
          (Array.isArray(originCountry) ? originCountry.includes('KR') : originCountry === 'KR')
        if (isKorean) {
          detectedType = 'manhwa'
        }
      }

      // Update mediaType if detection changed it
      if (detectedType !== mediaType) {
        mediaType = detectedType
      }

      // Get total episodes for TV series/anime
      if (mediaType === 'tv' || mediaType === 'anime') {
        totalEpisodes = mediaDetails.totalEpisodes || mediaDetails.episodes || mediaDetails.number_of_episodes || null
      }

      // Ensure poster/backdrop are set (check fallback fields)
      if (!posterUrl) {
        posterUrl = mediaDetails.poster ||
          mediaDetails.poster_path ||
          mediaDetails.coverImage?.large ||
          mediaDetails.coverImage ||
          null
      }

      if (!backdropUrl) {
        backdropUrl = mediaDetails.backdrop ||
          mediaDetails.backdrop_path ||
          mediaDetails.bannerImage ||
          mediaDetails.banner ||
          null
      }

      // Ensure title is set
      if (!title) title = mediaDetails.title || mediaDetails.name
      if (!name) name = mediaDetails.name || mediaDetails.title


      // Initialize progress if it doesn't exist
      const existingProgress = await UserProgress.findOne({
        userId,
        mediaId,
        mediaType,
      })

      if (!existingProgress) {
        const progressData = {
          userId,
          mediaId,
          mediaType,
        }

        if (totalEpisodes) {
          progressData.currentEpisode = 0
          progressData.totalEpisodes = totalEpisodes
          await UserProgress.create(progressData)
        }
      }

      // If adding to completed list, auto-mark all episodes/chapters
      if (listType === 'completed') {
        const progress = await UserProgress.findOne({
          userId,
          mediaId,
          mediaType,
        })

        if (progress) {
          // Mark all episodes as watched for TV/anime
          if ((mediaType === 'tv' || mediaType === 'anime') && totalEpisodes) {
            progress.currentEpisode = totalEpisodes
            progress.totalEpisodes = totalEpisodes
            await progress.save()
          }
        } else if (totalEpisodes) {
          // Create progress if it doesn't exist and mark as completed (only for TV/anime)
          if (mediaType === 'tv' || mediaType === 'anime') {
            const progressData = {
              userId,
              mediaId,
              mediaType,
              currentEpisode: totalEpisodes,
              totalEpisodes: totalEpisodes,
            }
            await UserProgress.create(progressData)
          }
        }
      }

      // Trigger achievement recalculation asynchronously (non-blocking)
      // Determine affected category for optimized recalculation
      let affectedCategory = null
      if (mediaType === 'movie') {
        affectedCategory = 'movies'
      } else if (mediaType === 'tv') {
        affectedCategory = 'series'
      } else if (mediaType === 'anime') {
        affectedCategory = listType === 'completed' ? 'anime' : null
      } else if (mediaType === 'manga' || mediaType === 'manhwa') {
        affectedCategory = 'manga'
      }

      // Only recalculate affected category
      if (affectedCategory) {
        achievementsService.checkAchievements(userId, affectedCategory)
          .catch(error => {
            console.error('Error recalculating achievements:', error)
          })
      } else {
        achievementsService.checkAllAchievements(userId)
          .catch(error => {
            console.error('Error recalculating achievements:', error)
          })
      }
    } catch (error) {
      console.error('Error fetching media details for list item:', error)
      // Continue without poster/backdrop if fetch fails
    }

    if (existing) {
      // If mediaType changed, we need to handle the unique constraint
      if (mediaType !== existing.mediaType) {
        // Check if an item with the new mediaType already exists
        const existingWithNewType = await UserList.findOne({
          userId,
          mediaId,
          mediaType,
        })

        if (existingWithNewType) {
          // Update the existing item with new type instead
          existingWithNewType.listType = listType
          existingWithNewType.rating = rating || existingWithNewType.rating
          existingWithNewType.notes = notes || existingWithNewType.notes
          if (posterUrl) existingWithNewType.posterUrl = posterUrl
          if (backdropUrl) existingWithNewType.backdropUrl = backdropUrl
          if (title) existingWithNewType.title = title
          if (name) existingWithNewType.name = name
          if (overview) existingWithNewType.overview = overview
          if (description) existingWithNewType.description = description
          if (originalLanguage) existingWithNewType.original_language = originalLanguage
          if (originCountry) existingWithNewType.origin_country = Array.isArray(originCountry) ? originCountry : [originCountry]

          // Delete the old item
          await existing.deleteOne()
          await existingWithNewType.save()

          // Update UserProgress mediaType
          await UserProgress.updateMany(
            { userId, mediaId, mediaType: existing.mediaType },
            { $set: { mediaType } }
          )

          return existingWithNewType.toJSON()
        } else {
          // Update mediaType on existing item
          existing.mediaType = mediaType

          // Update UserProgress mediaType
          await UserProgress.updateMany(
            { userId, mediaId, mediaType: existing.mediaType },
            { $set: { mediaType } }
          )
        }
      }

      existing.listType = listType
      existing.rating = rating || existing.rating
      existing.notes = notes || existing.notes
      if (posterUrl) existing.posterUrl = posterUrl
      if (backdropUrl) existing.backdropUrl = backdropUrl
      if (title) existing.title = title
      if (name) existing.name = name
      if (overview) existing.overview = overview
      if (description) existing.description = description
      // Store language/origin for future re-checks
      if (originalLanguage) existing.original_language = originalLanguage
      if (originCountry) existing.origin_country = Array.isArray(originCountry) ? originCountry : [originCountry]
      await existing.save()
      return existing.toJSON()
    }

    const listItem = await UserList.create({
      userId,
      mediaId,
      mediaType,
      listType,
      rating,
      notes,
      posterUrl,
      backdropUrl,
      title,
      name,
      overview,
      description,
      original_language: originalLanguage,
      origin_country: Array.isArray(originCountry) ? originCountry : (originCountry ? [originCountry] : []),
    })

    // Trigger achievement recalculation asynchronously (non-blocking)
    // Determine affected category for optimized recalculation
    let affectedCategory = null
    if (mediaType === 'movie') {
      affectedCategory = 'movies'
    } else if (mediaType === 'tv') {
      affectedCategory = 'series'
    } else if (mediaType === 'anime') {
      affectedCategory = listType === 'completed' ? 'anime' : null
      // Also check animeMovies if it's a completed anime without episodes
    } else if (mediaType === 'manga' || mediaType === 'manhwa') {
      affectedCategory = 'manga'
    }

    // Only recalculate affected category, not all achievements
    if (affectedCategory) {
      achievementsService.checkAchievements(userId, affectedCategory)
        .catch(error => {
          console.error('Error recalculating achievements:', error)
        })
    } else {
      // Fallback to full recalculation if category unknown
      achievementsService.checkAllAchievements(userId)
        .catch(error => {
          console.error('Error recalculating achievements:', error)
        })
    }

    return listItem.toJSON()
  },

  updateListItem: async (userId, listItemId, updates) => {
    const listItem = await UserList.findOne({
      _id: listItemId,
      userId,
    })

    if (!listItem) {
      throw new Error('List item not found')
    }

    // If marking as completed, auto-mark all episodes/chapters
    if (updates.listType === 'completed') {
      try {
        const progress = await UserProgress.findOne({
          userId,
          mediaId: listItem.mediaId,
          mediaType: listItem.mediaType,
        })

        // For TV series/anime: mark all episodes as watched
        if ((listItem.mediaType === 'tv' || listItem.mediaType === 'anime')) {
          if (progress) {
            // Fetch media details to get total episodes if not in progress
            if (!progress.totalEpisodes) {
              try {
                const mediaDetails = await mediaService.getDetails(listItem.mediaType, listItem.mediaId)
                const totalEpisodes = mediaDetails.totalEpisodes || mediaDetails.episodes || null
                if (totalEpisodes) {
                  progress.totalEpisodes = totalEpisodes
                }
              } catch (error) {
                console.error('Error fetching total episodes:', error)
              }
            }

            if (progress.totalEpisodes) {
              progress.currentEpisode = progress.totalEpisodes
              await progress.save()
            }
          } else {
            // Create progress if it doesn't exist
            try {
              const mediaDetails = await mediaService.getDetails(listItem.mediaType, listItem.mediaId)
              const totalEpisodes = mediaDetails.totalEpisodes || mediaDetails.episodes || null
              if (totalEpisodes) {
                await UserProgress.create({
                  userId,
                  mediaId: listItem.mediaId,
                  mediaType: listItem.mediaType,
                  currentEpisode: totalEpisodes,
                  totalEpisodes: totalEpisodes,
                })
              }
            } catch (error) {
              console.error('Error creating progress for completed item:', error)
            }
          }
        }

      } catch (error) {
        console.error('Error auto-marking episodes/chapters on completion:', error)
      }
    }

    Object.assign(listItem, updates)
    await listItem.save()

    return listItem.toJSON()
  },

  removeFromList: async (userId, listItemId) => {
    const listItem = await UserList.findOneAndDelete({
      _id: listItemId,
      userId,
    })

    if (!listItem) {
      throw new Error('List item not found')
    }

    // Reset progress when removing from list
    // Set all episodes/chapters to 0 (not watched)
    // For movies, this effectively marks them as not watched
    const progress = await UserProgress.findOne({
      userId,
      mediaId: listItem.mediaId,
      mediaType: listItem.mediaType,
    })

    if (progress) {
      // Reset all progress to 0
      progress.currentEpisode = 0
      progress.watchedMinutes = 0
      await progress.save()
    }

    // Trigger achievement recalculation asynchronously (non-blocking)
    // Determine affected category based on removed item
    let affectedCategory = null
    if (listItem.mediaType === 'movie') {
      affectedCategory = 'movies'
    } else if (listItem.mediaType === 'tv') {
      affectedCategory = 'series'
    } else if (listItem.mediaType === 'anime') {
      affectedCategory = 'anime'
    } else if (listItem.mediaType === 'manga' || listItem.mediaType === 'manhwa') {
      affectedCategory = 'manga'
    }

    // Only recalculate affected category
    if (affectedCategory) {
      achievementsService.checkAchievements(userId, affectedCategory)
        .catch(error => {
          console.error('Error recalculating achievements after removal:', error)
        })
    } else {
      achievementsService.checkAllAchievements(userId)
        .catch(error => {
          console.error('Error recalculating achievements after removal:', error)
        })
    }

    return { success: true }
  },

  updateProgress: async (userId, progressData) => {
    const { mediaId, mediaType, currentEpisode, currentEpisodes, totalEpisodes, ...updates } = progressData

    // Validate: current cannot exceed total
    const current = currentEpisode || currentEpisodes || 0
    const total = totalEpisodes || 0

    if (total > 0 && current > total) {
      const error = new Error('Current episode/chapter cannot exceed total')
      error.statusCode = 400
      throw error
    }

    // Don't allow updating totalEpisodes - it should come from media metadata
    const validatedUpdates = {
      ...updates,
      currentEpisode: current,
      currentEpisodes: current, // Support both field names
    }

    // Only include totalEpisodes if it's from the original media data (validation)
    // Don't allow users to modify it
    if (totalEpisodes && totalEpisodes > 0) {
      validatedUpdates.totalEpisodes = totalEpisodes
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId, mediaId, mediaType },
      validatedUpdates,
      { new: true, upsert: true }
    )

    return progress.toJSON()
  },
}


