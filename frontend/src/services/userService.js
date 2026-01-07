import api from './api'

export const userService = {
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`)
    return response.data
  },

  updateAvatar: async (avatarUrl) => {
    const response = await api.put('/users/avatar', { avatar: avatarUrl })
    return response.data
  },

  updateBanner: async (bannerUrl) => {
    const response = await api.put('/users/banner', { banner: bannerUrl })
    return response.data
  },

  updateBio: async (bio) => {
    const response = await api.put('/users/bio', { bio })
    return response.data
  },
  uploadImage: async (type, file) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post(`/users/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}


