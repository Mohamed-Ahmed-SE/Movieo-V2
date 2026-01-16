import { tmdbService } from './tmdbService.js'
import { anilistService } from './anilistService.js'

export const mediaService = {
  search: async (query, filters = {}) => {
    const { type, with_genres } = filters
    const results = []

    // Map frontend 'manhwa' to backend logic
    const isManhwa = type === 'manhwa'
    const isManga = type === 'manga'

    // If with_genres is provided, use discover instead of search
    if (with_genres && (type === 'movie' || type === 'tv' || type === 'anime')) {
      try {
        // For anime, discover TV shows with animation genre
        const searchType = type === 'anime' ? 'tv' : type
        const genreId = tmdbService.getGenreId(query, searchType)

        // For anime, ensure Animation genre (16) is included if not already
        const params = { with_genres: genreId }
        if (type === 'anime') {
          // If querying by genre for anime, make sure we look at TV shows
          // Note: TMDB doesn't have a specific "Anime" genre, it uses Animation (16) + Japanese Language
          params.with_original_language = 'ja'
          if (!genreId) params.with_genres = '16'
        }

        if (genreId || type === 'anime') {
          const discoverResults = await tmdbService.discover(searchType, params)
          results.push(...discoverResults)
        }
      } catch (error) {
        console.error('TMDB discover error:', error)
      }
      // Return early if we got genre results
      if (results.length > 0) {
        return results
          .map(item => normalizeTMDBItem(item))
          .filter(item => item.poster || item.poster_path || item.coverImage?.large)
      }
    }

    // TMDB Search (Movies, TV, and now Anime via TV)
    if (!type || type === 'movie' || type === 'tv' || type === 'anime') {
      try {
        // If searching specifically for anime, search TV shows
        const searchType = type === 'anime' ? 'tv' : (type || 'multi')
        const tmdbResults = await tmdbService.search(query, searchType)
        results.push(...tmdbResults)
      } catch (error) {
        console.error('TMDB search error:', error)
      }
    }

    // Search AniList ONLY for manga and manhwa
    if (!type || isManga || isManhwa) {
      try {
        // Search manga from AniList
        console.log(`Searching AniList for manga with query: "${query}"`)
        const mangaResults = await anilistService.search(query, 'MANGA')
        console.log(`AniList returned ${mangaResults.length} manga results`)

        // Map results to ensure correct type
        const finalResults = mangaResults.map(item => ({
          ...item,
          type: isManhwa ? 'manhwa' : 'manga'
        }))
        results.push(...finalResults)
      } catch (error) {
        console.error('AniList manga search error:', error)
      }
    }

    // Filter and Normalize Results
    const filteredResults = results
      .map(item => {
        // Apply strict anime detection for TMDB items
        if (item.media_type === 'tv' || item.type === 'tv') {
          return normalizeTMDBItem(item)
        }
        return item
      })
      // If filtering by anime, only show detected anime
      .filter(item => {
        if (type === 'anime') return item.type === 'anime'
        return true
      })
      .filter(item => {
        return item.poster || item.poster_path || item.coverImage?.large || item.coverImage?.extraLarge
      })

    return filteredResults
  },

  getDetails: async (type, id) => {
    if (type === 'movie' || type === 'tv' || type === 'anime') {
      // For anime, fetch as TV show from TMDB
      const fetchType = type === 'anime' ? 'tv' : type
      const details = await tmdbService.getDetails(fetchType, id)
      return normalizeTMDBItem(details)
    } else if (type === 'manga' || type === 'manhwa') {
      // Use AniList API for manga/manhwa
      return await anilistService.getDetails(id, 'MANGA')
    }

    throw new Error('Invalid media type')
  },

  getEpisodes: async (type, id, season = 1) => {
    if (type === 'tv' || type === 'anime') {
      // Fetch episodes from TMDB (anime is treated as TV)
      return await tmdbService.getEpisodes(id, season)
    } else if (type === 'manga' || type === 'manhwa') {
      // For manga/manhwa, return empty array (chapters are generated on frontend)
      return []
    }

    throw new Error('Episodes not available for this media type')
  },

  getCharacters: async (type, id) => {
    if (type === 'movie' || type === 'tv' || type === 'anime') {
      const fetchType = type === 'anime' ? 'tv' : type
      const details = await tmdbService.getDetails(fetchType, id)
      return details.credits || { cast: [], crew: [] }
    } else if (type === 'manga' || type === 'manhwa') {
      const details = await anilistService.getDetails(id, 'MANGA')
      return details.characters || []
    }

    throw new Error('Characters not available for this media type')
  },

  getPerson: async (id) => {
    return await tmdbService.getPerson(id)
  },

  getTrending: async (type) => {
    try {
      if (!type || type === 'all') {
        const [tmdbResults, mangaResults] = await Promise.allSettled([
          tmdbService.getTrending('all'),
          anilistService.getTrending('MANGA'), // Get trending manga from AniList
        ])

        const allResults = []

        if (tmdbResults.status === 'fulfilled') {
          // Normalize TMDB results (some TV might be Anime)
          const normalizedTMDB = (tmdbResults.value || []).map(normalizeTMDBItem)
          allResults.push(...normalizedTMDB)
        }

        if (mangaResults.status === 'fulfilled') {
          allResults.push(...(mangaResults.value || []))
        }

        return allResults.sort(() => Math.random() - 0.5)
      } else if (type === 'movie' || type === 'tv' || type === 'anime') {
        // Fetch trending from TMDB
        const fetchType = type === 'anime' ? 'tv' : type
        const results = await tmdbService.getTrending(fetchType)

        // Normalize
        const normalized = results.map(normalizeTMDBItem)

        // If specifically asking for anime, filter for strict anime
        if (type === 'anime') {
          return normalized.filter(item => item.type === 'anime')
        }

        return normalized
      } else if (type === 'manga' || type === 'manhwa') {
        // Use AniList API for manga/manhwa trending
        try {
          const results = await anilistService.getTrending('MANGA')
          return results.map(item => ({
            ...item,
            type: type === 'manhwa' ? 'manhwa' : 'manga'
          }))
        } catch (error) {
          console.error('AniList manga trending error, returning empty array:', error.message)
          return []
        }
      }

      throw new Error('Invalid media type')
    } catch (error) {
      console.error('Error in getTrending:', error)
      throw error
    }
  },

  getImages: async (type, id) => {
    if (type === 'movie' || type === 'tv' || type === 'anime') {
      const fetchType = type === 'anime' ? 'tv' : type
      return await tmdbService.getImages(fetchType, id)
    }

    // For manga/manhwa, use AniList API
    if (type === 'manga' || type === 'manhwa') {
      try {
        const details = await anilistService.getDetails(id, 'MANGA')

        let backdrops = []
        let posters = []

        // Add AniList images
        if (details.backdrop) {
          backdrops.push({
            file_path: details.backdrop,
            fullPath: details.backdrop,
            width: 1920,
            height: 1080,
            iso_639_1: null
          })
        }

        // Use coverImage as backdrop if bannerImage is missing
        if (!details.backdrop && details.poster) {
          backdrops.push({
            file_path: details.poster,
            fullPath: details.poster,
            width: 500,
            height: 750,
            iso_639_1: null
          })
        }

        if (details.poster) {
          posters.push({
            file_path: details.poster,
            fullPath: details.poster,
            width: 500,
            height: 750,
            iso_639_1: null
          })
        }

        // Try to get more images from TMDB for manga/manhwa
        try {
          const searchTitles = [
            details.title || details.name,
            details.name || details.title,
            (details.title || details.name)?.replace(/[^\w\s]/g, ''),
            (details.title || details.name)?.split(/[:–—]/)[0]?.trim(),
          ].filter(Boolean)

          let match = null
          for (const searchTitle of searchTitles) {
            if (!searchTitle) continue
            try {
              const tmdbMovieSearch = await tmdbService.search(searchTitle, 'movie')
              const tmdbMovieResults = Array.isArray(tmdbMovieSearch) ? tmdbMovieSearch : []

              if (tmdbMovieResults.length > 0) {
                match = tmdbMovieResults.find(r => {
                  const searchLower = searchTitle.toLowerCase()
                  const tmdbTitle = (r.title || r.name || '').toLowerCase()
                  return tmdbTitle === searchLower ||
                    tmdbTitle.includes(searchLower) ||
                    searchLower.includes(tmdbTitle)
                }) || tmdbMovieResults[0]

                if (match) {
                  const tmdbImages = await tmdbService.getImages('movie', match.id)
                  if (tmdbImages?.backdrops && tmdbImages.backdrops.length > 0) {
                    backdrops.push(...tmdbImages.backdrops)
                  }
                  if (tmdbImages?.posters && tmdbImages.posters.length > 0) {
                    posters.push(...tmdbImages.posters)
                  }
                  break
                }
              }
            } catch (err) {
              continue
            }
          }
        } catch (tmdbError) {
          console.debug('Could not find additional images from TMDB for manga:', details.title || details.name)
        }

        return {
          backdrops: backdrops,
          posters: posters,
          logos: []
        }
      } catch (error) {
        console.error('Error fetching AniList manga images:', error)
        return { backdrops: [], posters: [], logos: [] }
      }
    }
    // Fallback
    return { backdrops: [], logos: [], posters: [] }
  },
}

// Helper to normalized TMDB items and strictly detect Anime
const normalizeTMDBItem = (item) => {
  if (!item) return item

  let type = item.media_type || item.mediaType || item.type

  // Normalize basic types
  if (type === 'series') type = 'tv'

  // Strict Anime Detection for TMDB items
  // Must be TV + Japanese Language (Original or Spoken) + Origin Country JP
  if (type === 'tv') {
    const isJapanese = item.original_language === 'ja' ||
      (item.origin_country && (item.origin_country.includes('JP') || item.origin_country === 'JP'))

    if (isJapanese) {
      type = 'anime'
    }
  }

  return {
    ...item,
    type: type,
    mediaType: type,
    media_type: type
  }
}
