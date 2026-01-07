import axios from 'axios'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 3600 }) // 1 hour cache

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const tmdbService = {
  getApiKey: () => process.env.TMDB_API_KEY,

  getHeaders: () => ({
    'Content-Type': 'application/json',
  }),

  search: async (query, type = 'multi') => {
    const cacheKey = `tmdb_search_${type}_${query}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const endpoint = type === 'multi' ? '/search/multi' : `/search/${type}`
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: tmdbService.getHeaders(),
        params: {
          query,
          api_key: process.env.TMDB_API_KEY
        },
      })

      const results = response.data.results
        .filter((item) => {
          // Filter out items without posters
          return item.poster_path !== null && item.poster_path !== undefined
        })
        .map((item) => ({
          id: item.id.toString(),
          type: item.media_type || type,
          title: item.title || item.name,
          overview: item.overview,
          poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
          backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
          releaseDate: item.release_date || item.first_air_date,
          rating: item.vote_average,
        }))

      cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error('TMDB search error:', error)
      throw error
    }
  },

  getDetails: async (type, id) => {
    const cacheKey = `tmdb_details_${type}_${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: tmdbService.getHeaders(),
        params: {
          api_key: process.env.TMDB_API_KEY,
          append_to_response: 'videos,images,credits,recommendations,similar',
        },
      })

      const data = response.data
      const result = {
        id: data.id.toString(),
        type,
        title: data.title || data.name,
        overview: data.overview,
        poster: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
        backdrop: data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null,
        releaseDate: data.release_date || data.first_air_date,
        release_date: data.release_date || null,
        first_air_date: data.first_air_date || null,
        rating: data.vote_average,
        runtime: data.runtime || data.episode_run_time?.[0] || null,
        original_language: data.original_language || null,
        status: data.status || null,
        genres: data.genres?.map((g) => g.name) || [],
        images: data.images?.backdrops?.map((img) => `${TMDB_IMAGE_BASE}/original${img.file_path}`) || [],
        posters: data.images?.posters?.map((img) => `${TMDB_IMAGE_BASE}/w500${img.file_path}`) || [],
        totalEpisodes: data.number_of_episodes || null,
        totalSeasons: data.number_of_seasons || null,
        seasons: data.seasons || [],
        videos: data.videos?.results || [],
        credits: {
          cast: data.credits?.cast?.map((c) => ({
            id: c.id,
            name: c.name,
            character: c.character,
            image: c.profile_path ? `${TMDB_IMAGE_BASE}/w500${c.profile_path}` : null,
          })) || [],
          crew: data.credits?.crew?.map((c) => ({
            id: c.id,
            name: c.name,
            job: c.job,
            department: c.department,
            image: c.profile_path ? `${TMDB_IMAGE_BASE}/w500${c.profile_path}` : null,
          })) || []
        },
        // Flatten for easy access in Details (backward compatibility if needed)
        characters: data.credits?.cast?.slice(0, 20).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          image: c.profile_path ? `${TMDB_IMAGE_BASE}/w500${c.profile_path}` : null,
        })) || [],
        // Recommendations and similar
        recommendations: data.recommendations?.results?.map((rec) => ({
          id: rec.id.toString(),
          title: rec.title || rec.name,
          poster_path: rec.poster_path,
          backdrop_path: rec.backdrop_path,
          release_date: rec.release_date || rec.first_air_date,
          vote_average: rec.vote_average,
          mediaType: type,
        })) || [],
        similar: data.similar?.results?.map((sim) => ({
          id: sim.id.toString(),
          title: sim.title || sim.name,
          poster_path: sim.poster_path,
          backdrop_path: sim.backdrop_path,
          release_date: sim.release_date || sim.first_air_date,
          vote_average: sim.vote_average,
          mediaType: type,
        })) || [],
      }

      cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('TMDB getDetails error:', error)
      throw error
    }
  },

  getEpisodes: async (id, seasonNumber = 1) => {
    const cacheKey = `tmdb_episodes_${id}_${seasonNumber}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}`, {
        headers: tmdbService.getHeaders(),
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      })

      const episodes = response.data.episodes.map((ep) => ({
        id: ep.id,
        episodeNumber: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        airDate: ep.air_date,
        still: ep.still_path ? `${TMDB_IMAGE_BASE}/w500${ep.still_path}` : null,
      }))

      cache.set(cacheKey, episodes)
      return episodes
    } catch (error) {
      console.error('TMDB getEpisodes error:', error)
      throw error
    }
  },

  // Genre ID mapping for TMDB
  getGenreId: (genreName, type = 'movie') => {
    const genreMaps = {
      movie: {
        'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35, 'Crime': 80,
        'Documentary': 99, 'Drama': 18, 'Family': 10751, 'Fantasy': 14, 'History': 36,
        'Horror': 27, 'Music': 10402, 'Mystery': 9648, 'Romance': 10749, 'Sci-Fi': 878,
        'Thriller': 53, 'War': 10752, 'Western': 37
      },
      tv: {
        'Action': 10759, 'Adventure': 10759, 'Animation': 16, 'Comedy': 35, 'Crime': 80,
        'Documentary': 99, 'Drama': 18, 'Family': 10751, 'Fantasy': 10765, 'History': 36,
        'Horror': 27, 'Music': 10402, 'Mystery': 9648, 'Romance': 10749, 'Sci-Fi': 10765,
        'Thriller': 53, 'War': 10768, 'Western': 37, 'Slice of Life': 10765
      }
    }
    return genreMaps[type]?.[genreName] || null
  },

  discover: async (type = 'movie', filters = {}) => {
    const cacheKey = `tmdb_discover_${type}_${JSON.stringify(filters)}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv'
      const params = {
        api_key: process.env.TMDB_API_KEY,
        sort_by: 'popularity.desc',
        ...filters
      }

      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: tmdbService.getHeaders(),
        params,
      })

      const results = response.data.results
        .filter((item) => item.poster_path !== null && item.poster_path !== undefined)
        .map((item) => ({
          id: item.id.toString(),
          type: type,
          title: item.title || item.name,
          overview: item.overview,
          poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
          backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
          releaseDate: item.release_date || item.first_air_date,
          rating: item.vote_average,
          genre_ids: item.genre_ids || [],
        }))

      cache.set(cacheKey, results, 1800) // 30 min cache
      return results
    } catch (error) {
      console.error('TMDB discover error:', error)
      throw error
    }
  },

  getTrending: async (type = 'all') => {
    const cacheKey = `tmdb_trending_${type}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      if (!process.env.TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is not configured in environment variables')
      }

      const endpoint = type === 'all' ? '/trending/all/day' : `/trending/${type}/day`
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: tmdbService.getHeaders(),
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      })

      if (response.data.status_code === 7) {
        throw new Error('Invalid TMDB API key. Please check your .env file and ensure TMDB_API_KEY is set correctly.')
      }

      const results = response.data.results.map((item) => ({
        id: item.id.toString(),
        type: item.media_type || type,
        title: item.title || item.name,
        overview: item.overview,
        poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
        backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
        releaseDate: item.release_date || item.first_air_date,
        rating: item.vote_average,
        genre_ids: item.genre_ids || [], // Include genre_ids from TMDB trending
      }))

      cache.set(cacheKey, results, 1800) // 30 min cache for trending
      return results
    } catch (error) {
      console.error('TMDB getTrending error:', error.message || error)
      if (error.response?.data?.status_code === 7) {
        const apiError = new Error('Invalid TMDB API key. Please check your backend/.env file and ensure TMDB_API_KEY is set correctly.')
        apiError.statusCode = 401
        throw apiError
      }
      throw error
    }
  }, // Added comma here to correctly separate getTrending from getPerson

  getPerson: async (id) => {
    const cacheKey = `tmdb_person_${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/person/${id}`, {
        headers: tmdbService.getHeaders(),
        params: {
          api_key: process.env.TMDB_API_KEY,
          append_to_response: 'combined_credits,images',
        },
      })

      const data = response.data
      const result = {
        id: data.id,
        name: data.name,
        biography: data.biography,
        birthday: data.birthday,
        deathday: data.deathday,
        placeOfBirth: data.place_of_birth,
        profilePath: data.profile_path ? `${TMDB_IMAGE_BASE}/original${data.profile_path}` : null,
        images: data.images?.profiles?.map(i => `${TMDB_IMAGE_BASE}/original${i.file_path}`) || [],
        knownFor: data.known_for_department,
        credits: data.combined_credits?.cast?.map(c => ({
          id: c.id,
          title: c.title || c.name,
          poster: c.poster_path ? `${TMDB_IMAGE_BASE}/w500${c.poster_path}` : null,
          mediaType: c.media_type, // movie or tv
          character: c.character,
          year: c.release_date || c.first_air_date ? new Date(c.release_date || c.first_air_date).getFullYear() : 'N/A',
          voteAverage: c.vote_average,
        })).sort((a, b) => {
          const yearA = parseInt(a.year) || 0
          const yearB = parseInt(b.year) || 0
          return yearB - yearA
        }) || []
      }

      cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('TMDB getPerson error:', error)
      throw error
    }
  },

  getImages: async (type, id) => {
    const cacheKey = `tmdb_images_${type}_${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const endpoint = type === 'movie' ? `/movie/${id}/images` : `/tv/${id}/images`
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: tmdbService.getHeaders(),
        params: {
          api_key: process.env.TMDB_API_KEY,
          include_image_language: 'en,null' // Get English logos and those without language
        },
      })

      const data = response.data
      const result = {
        id: data.id,
        backdrops: data.backdrops?.map(img => ({
          filePath: `${TMDB_IMAGE_BASE}/original${img.file_path}`,
          width: img.width,
          height: img.height,
          iso_639_1: img.iso_639_1
        })) || [],
        logos: data.logos?.map(img => ({
          file_path: img.file_path, // Keep original path relative for flexible usage or full
          fullPath: `${TMDB_IMAGE_BASE}/original${img.file_path}`,
          width: img.width,
          height: img.height,
          iso_639_1: img.iso_639_1
        })) || [],
        posters: data.posters?.map(img => ({
          filePath: `${TMDB_IMAGE_BASE}/w500${img.file_path}`,
          width: img.width,
          height: img.height,
          iso_639_1: img.iso_639_1
        })) || []
      }

      cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('TMDB getImages error:', error)
      throw error
    }
  },
}
