import { createSlice } from '@reduxjs/toolkit'

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
  return {
    theme: 'dark',
    autoPlayTrailers: false,
    showAdultContent: false,
    emailNotifications: true,
  }
}

const initialState = loadSettings()

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: (state, action) => {
      const { key, value } = action.payload
      state[key] = value
      // Save to localStorage
      try {
        localStorage.setItem('appSettings', JSON.stringify(state))
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    },
    resetSettings: (state) => {
      const defaultSettings = {
        theme: 'dark',
        autoPlayTrailers: false,
        showAdultContent: false,
        emailNotifications: true,
      }
      Object.assign(state, defaultSettings)
      try {
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings))
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    },
  },
})

export const { updateSetting, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer
