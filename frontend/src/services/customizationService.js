import api from './api'

export const customizationService = {
  getAllCustomizations: async () => {
    const response = await api.get('/customization')
    return response.data
  },

  getCustomization: async (mediaId, type) => {
    const response = await api.get(`/customization/${mediaId}`, {
      params: { type },
    })
    return response.data
  },

  updateCustomization: async (mediaId, type, customizations) => {
    const response = await api.put(`/customization/${mediaId}`, {
      type,
      ...customizations,
    })
    return response.data
  },
}


