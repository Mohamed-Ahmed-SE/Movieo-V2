import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentMedia: null,
  searchResults: [],
  isLoading: false,
  error: null,
}

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setCurrentMedia: (state, action) => {
      state.currentMedia = action.payload
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
  },
})

export const { setCurrentMedia, setSearchResults, setLoading, setError, clearSearchResults } = mediaSlice.actions
export default mediaSlice.reducer


