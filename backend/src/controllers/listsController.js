import { listsService } from '../services/listsService.js'

export const listsController = {
  getUserLists: async (req, res, next) => {
    try {
      const lists = await listsService.getUserLists(req.user._id)
      res.json({
        success: true,
        data: lists,
      })
    } catch (error) {
      next(error)
    }
  },

  addToList: async (req, res, next) => {
    try {
      const listItem = await listsService.addToList(req.user._id, req.body)
      res.status(201).json({
        success: true,
        data: listItem,
      })
    } catch (error) {
      console.error('Error adding to list:', error)
      next(error)
    }
  },

  updateListItem: async (req, res, next) => {
    try {
      const { id } = req.params
      const listItem = await listsService.updateListItem(req.user._id, id, req.body)
      res.json({
        success: true,
        data: listItem,
      })
    } catch (error) {
      next(error)
    }
  },

  removeFromList: async (req, res, next) => {
    try {
      const { id } = req.params
      await listsService.removeFromList(req.user._id, id)
      res.json({
        success: true,
        message: 'Item removed from list',
      })
    } catch (error) {
      next(error)
    }
  },

  updateProgress: async (req, res, next) => {
    try {
      const progress = await listsService.updateProgress(req.user._id, req.body)
      res.json({
        success: true,
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  },
}


