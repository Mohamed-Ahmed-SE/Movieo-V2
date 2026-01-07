import { mediaService } from '../services/mediaService.js'

export const mediaController = {
  search: async (req, res, next) => {
    try {
      const { q, type } = req.query
      const results = await mediaService.search(q, { type })
      res.json({
        success: true,
        results,
      })
    } catch (error) {
      next(error)
    }
  },

  getDetails: async (req, res, next) => {
    try {
      const { type, id } = req.params
      const details = await mediaService.getDetails(type, id)
      res.json({
        success: true,
        data: details,
      })
    } catch (error) {
      console.error('Error fetching details:', error)
      next(error)
    }
  },

  getEpisodes: async (req, res, next) => {
    try {
      const { type, id } = req.params
      const { season } = req.query
      
      // For manga/manhwa, return empty array (chapters are handled on frontend)
      if (type === 'manga' || type === 'manhwa') {
        return res.json({
          success: true,
          data: [],
        })
      }
      
      const episodes = await mediaService.getEpisodes(type, id, season)
      res.json({
        success: true,
        data: episodes,
      })
    } catch (error) {
      console.error('Error fetching episodes:', error)
      next(error)
    }
  },

  getCharacters: async (req, res, next) => {
    try {
      const { type, id } = req.params
      const characters = await mediaService.getCharacters(type, id)
      res.json({
        success: true,
        data: characters,
      })
    } catch (error) {
      next(error)
    }
  },

  getPerson: async (req, res, next) => {
    try {
      const { id } = req.params
      const person = await mediaService.getPerson(id)
      res.json({
        success: true,
        data: person,
      })
    } catch (error) {
      console.error('Error fetching person:', error)
      // Return 404 if person not found
      if (error.response?.status === 404 || error.message?.includes('404')) {
        return res.status(404).json({
          success: false,
          message: 'Person not found',
        })
      }
      next(error)
    }
  },

  getTrending: async (req, res, next) => {
    try {
      const type = req.params.type || 'all'
      const results = await mediaService.getTrending(type)
      res.json({
        success: true,
        results: Array.isArray(results) ? results : [],
      })
    } catch (error) {
      // If it's an API key error, return a helpful message
      if (error.message?.includes('API key')) {
        return res.status(401).json({
          success: false,
          message: error.message,
          error: 'INVALID_API_KEY',
        })
      }
      next(error)
    }
  },

  getImages: async (req, res, next) => {
    try {
      const { type, id } = req.params
      const images = await mediaService.getImages(type, id)
      res.json({
        success: true,
        data: images,
      })
    } catch (error) {
      console.error('Error fetching images:', error)
      // Return empty structure instead of error for anime/manga/manhwa
      if (type === 'anime' || type === 'manga' || type === 'manhwa') {
        return res.json({
          success: true,
          data: { backdrops: [], logos: [], posters: [] },
        })
      }
      next(error)
    }
  },
}
