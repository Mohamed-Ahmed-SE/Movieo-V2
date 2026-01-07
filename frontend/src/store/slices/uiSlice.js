import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loading: false,
  modals: {
    guestAction: false,
    mediaCard: false,
  },
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    openModal: (state, action) => {
      const { modalName } = action.payload
      state.modals[modalName] = true
    },
    closeModal: (state, action) => {
      const { modalName } = action.payload
      state.modals[modalName] = false
    },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload })
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { setLoading, openModal, closeModal, addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer


