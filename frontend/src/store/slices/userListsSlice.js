import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  lists: {
    watching: [],
    completed: [],
    planned: [],
    dropped: [],
    onHold: [],
  },
  isLoading: false,
  error: null,
}

const userListsSlice = createSlice({
  name: 'userLists',
  initialState,
  reducers: {
    setLists: (state, action) => {
      state.lists = action.payload
    },
    addToList: (state, action) => {
      const { listType, item } = action.payload
      // Remove from other lists if present
      Object.keys(state.lists).forEach((key) => {
        if (key !== listType && Array.isArray(state.lists[key])) {
          state.lists[key] = state.lists[key].filter((i) => i.mediaId !== item.mediaId)
        }
      })
      // Add to target list if not already present
      if (!Array.isArray(state.lists[listType])) {
        state.lists[listType] = []
      }
      const exists = state.lists[listType].some((i) => i.mediaId === item.mediaId)
      if (!exists) {
        state.lists[listType].push(item)
      }
    },
    removeFromList: (state, action) => {
      const { listType, mediaId } = action.payload
      state.lists[listType] = state.lists[listType].filter((i) => i.mediaId !== mediaId)
    },
    updateListItem: (state, action) => {
      const { listType, mediaId, updates } = action.payload
      const index = state.lists[listType].findIndex((i) => i.mediaId === mediaId)
      if (index !== -1) {
        state.lists[listType][index] = { ...state.lists[listType][index], ...updates }
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setLists, addToList, removeFromList, updateListItem, setLoading, setError } = userListsSlice.actions
export default userListsSlice.reducer


