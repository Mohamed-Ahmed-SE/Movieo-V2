import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  customizations: {}, // { mediaId: { customBackground, customPoster } }
  isLoading: false,
  error: null,
}

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    setCustomization: (state, action) => {
      const { mediaId, customization } = action.payload
      state.customizations[mediaId] = customization
    },
    setAllCustomizations: (state, action) => {
      state.customizations = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearCustomizations: (state) => {
      state.customizations = {}
    },
  },
})

export const { setCustomization, setAllCustomizations, setLoading, setError, clearCustomizations } = customizationSlice.actions
export default customizationSlice.reducer
