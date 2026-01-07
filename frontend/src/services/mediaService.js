import api from './api'

export const mediaService = {
  search: async (query, filters = {}) => {
    const response = await api.get('/media/search', {
      params: { q: query, ...filters },
    })
    return response.data.results || []
  },

  getDetails: async (type, id) => {
    const response = await api.get(`/media/${type}/${id}`)
    return response.data.data
  },

  getEpisodes: async (type, id, season = 1) => {
    const response = await api.get(`/media/${type}/${id}/episodes`, {
      params: { season }
    })
    return response.data.data
  },

  getCharacters: async (type, id) => {
    const response = await api.get(`/media/${type}/${id}/characters`)
    return response.data.data
  },

  getPerson: async (id) => {
    const response = await api.get(`/media/person/${id}`)
    return response.data.data
  },

  getTrending: async (type) => {
    const url = type ? `/media/trending/${type}` : '/media/trending'
    const response = await api.get(url)
    return response.data.results || []
  },

  getVideos: async (id, type) => {
    try {
      const details = await mediaService.getDetails(type, id)
      return details.videos || []
    } catch (e) {
      console.error("Error fetching videos", e)
      return []
    }
  },

  getImages: async (type, id) => {
    const response = await api.get(`/media/${type}/${id}/images`)
    return response.data.data
  },
}
