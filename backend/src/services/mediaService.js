import { tmdbService } from './tmdbService.js'
import { anilistService } from './anilistService.js'

export const mediaService = {
  search: async (query, filters = {}) => {
    const { type, with_genres } = filters
    const results = []
    
    // If with_genres is provided, use discover instead of search
    if (with_genres && (type === 'movie' || type === 'tv')) {
      try {
        const genreId = tmdbService.getGenreId(query, type)
        if (genreId) {
          const discoverResults = await tmdbService.discover(type, { with_genres: genreId })
          results.push(...discoverResults)
        }
      } catch (error) {
        console.error('TMDB discover error:', error)
      }
      // Return early if we got genre results
      if (results.length > 0) {
        return results.filter(item => item.poster || item.poster_path || item.coverImage?.large)
      }
    }

    // Map frontend 'manhwa' to backend logic
    const isManhwa = type === 'manhwa'
    const isManga = type === 'manga'

    if (!type || type === 'movie' || type === 'tv') {
      try {
        const tmdbResults = await tmdbService.search(query, type || 'multi')
        results.push(...tmdbResults)
      } catch (error) {
        console.error('TMDB search error:', error)
      }
    }

    // Search AniList for anime
    if (!type || type === 'anime') {
      try {
        const animeResults = await anilistService.search(query, 'ANIME')
        results.push(...animeResults)
      } catch (error) {
        console.error('AniList anime search error:', error)
      }
    }

    // Search AniList for manga and manhwa
    if (!type || isManga || isManhwa) {
      try {
        // Search manga from AniList
        const mangaResults = await anilistService.search(query, 'MANGA')
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

    // Filter out results without posters
    const filteredResults = results.filter(item => {
      return item.poster || item.poster_path || item.coverImage?.large || item.coverImage?.extraLarge
    })

    return filteredResults
  },

  getDetails: async (type, id) => {
    if (type === 'movie' || type === 'tv') {
      return await tmdbService.getDetails(type, id)
    } else if (type === 'anime') {
      return await anilistService.getDetails(id, 'ANIME')
    } else if (type === 'manga' || type === 'manhwa') {
      // Use AniList API for manga/manhwa
      return await anilistService.getDetails(id, 'MANGA')
    }

    throw new Error('Invalid media type')
  },

  getEpisodes: async (type, id, season = 1) => {
    if (type === 'tv') {
      return await tmdbService.getEpisodes(id, season)
    } else if (type === 'anime' || type === 'manga' || type === 'manhwa') {
      // For anime/manga/manhwa, return empty array (episodes/chapters are generated on frontend)
      return []
    }

    throw new Error('Episodes not available for this media type')
  },

  getCharacters: async (type, id) => {
    if (type === 'movie' || type === 'tv') {
      const details = await tmdbService.getDetails(type, id)
      return details.credits || { cast: [], crew: [] }
    } else if (type === 'anime' || type === 'manga' || type === 'manhwa') {
      const details = await anilistService.getDetails(id, type === 'manga' || type === 'manhwa' ? 'MANGA' : 'ANIME')
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
        const [tmdbResults, animeResults, mangaResults] = await Promise.allSettled([
          tmdbService.getTrending('all'),
          anilistService.getTrending('ANIME'),
          anilistService.getTrending('MANGA'), // Get trending manga from AniList
        ])

        const allResults = []

        if (tmdbResults.status === 'fulfilled') {
          allResults.push(...(tmdbResults.value || []))
        }

        if (animeResults.status === 'fulfilled') {
          allResults.push(...(animeResults.value || []))
        }

        if (mangaResults.status === 'fulfilled') {
          allResults.push(...(mangaResults.value || []))
        }

        return allResults.sort(() => Math.random() - 0.5)
      } else if (type === 'movie' || type === 'tv') {
        return await tmdbService.getTrending(type)
      } else if (type === 'anime') {
        try {
          const results = await anilistService.getTrending('ANIME')
          return results
        } catch (error) {
          console.error('AniList error, returning empty array:', error.message)
          return []
        }
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
    if (type === 'movie' || type === 'tv') {
      return await tmdbService.getImages(type, id)
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
    
    // For anime, AniList doesn't provide logos like TMDB
    // Try to get logo from TMDB if the anime exists there
    if (type === 'anime') {
      try {
        // Get media details to return poster/backdrop info
        const details = await anilistService.getDetails(id, 'ANIME')
        
        // Try to find logo from TMDB by searching for the anime title
        let logos = []
        try {
          // Try multiple search variations
          const searchTitles = [
            details.title || details.name,
            details.name || details.title,
            // Try without special characters
            (details.title || details.name)?.replace(/[^\w\s]/g, ''),
            // Try first part of title (before colon, dash, etc.)
            (details.title || details.name)?.split(/[:–—]/)[0]?.trim(),
          ].filter(Boolean)
          
          let match = null
          for (const searchTitle of searchTitles) {
            if (!searchTitle) continue
            try {
              const tmdbSearch = await tmdbService.search(searchTitle, 'tv')
              const tmdbResults = Array.isArray(tmdbSearch) ? tmdbSearch : []
              
              if (tmdbResults.length > 0) {
                // Find best match
                match = tmdbResults.find(r => {
                  const searchLower = searchTitle.toLowerCase()
                  const tmdbTitle = (r.title || r.name || '').toLowerCase()
                  return tmdbTitle === searchLower || 
                         tmdbTitle.includes(searchLower) || 
                         searchLower.includes(tmdbTitle) ||
                         Math.abs(tmdbTitle.length - searchLower.length) < 3 // Similar length
                }) || tmdbResults[0]
                
                if (match) break
              }
            } catch (err) {
              // Continue to next search variation
              continue
            }
          }
          
          if (match && match.id) {
            // Get images from TMDB for the matched result
            const tmdbImages = await tmdbService.getImages('tv', match.id)
            if (tmdbImages?.logos && tmdbImages.logos.length > 0) {
              logos = tmdbImages.logos
            }
          }
        } catch (tmdbError) {
          // Silent fail - TMDB search might not find the anime
          console.debug('Could not find logo from TMDB for anime:', details.title || details.name)
        }
        
        // For manga/manhwa, try to get more images from TMDB
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
        
        // Use coverImage as backdrop if bannerImage is missing (for manga)
        if (!details.backdrop && details.poster && (type === 'manga' || type === 'manhwa')) {
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
        if (type === 'manga' || type === 'manhwa') {
          try {
            // Search TMDB for the manga title
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
                // Try searching as movie first (some manga adaptations are movies)
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
            // Silent fail
            console.debug('Could not find additional images from TMDB for manga:', details.title || details.name)
          }
        }
        
        return {
          backdrops: backdrops,
          logos: logos,
          posters: posters
        }
      } catch (error) {
        console.error('Error fetching AniList images:', error)
        return { backdrops: [], logos: [], posters: [] }
      }
    }
    // Fallback
    return { backdrops: [], logos: [], posters: [] }
  },
}
