import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import mediaReducer from './slices/mediaSlice'
import userListsReducer from './slices/userListsSlice'
import uiReducer from './slices/uiSlice'
import customizationReducer from './slices/customizationSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
    userLists: userListsReducer,
    ui: uiReducer,
    customization: customizationReducer,
    settings: settingsReducer,
  },
})
