import api from './api'

export const listsService = {
  getUserLists: async () => {
    const response = await api.get('/lists')
    return response.data
  },

  addToList: async (listData) => {
    const response = await api.post('/lists', listData)
    return response.data
  },

  updateListItem: async (listItemId, updates) => {
    const response = await api.put(`/lists/${listItemId}`, updates)
    return response.data
  },

  removeFromList: async (listItemId) => {
    const response = await api.delete(`/lists/${listItemId}`)
    return response.data
  },

  updateProgress: async (progressData) => {
    const response = await api.post('/lists/progress', progressData)
    return response.data
  },
}


