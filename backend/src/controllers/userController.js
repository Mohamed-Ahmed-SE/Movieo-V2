import { userService } from '../services/userService.js'
import User from '../models/User.js'
import fs from 'fs'
import path from 'path'

export const userController = {
  getProfile: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user._id
      const profile = await userService.getUserProfile(userId)
      res.json({
        success: true,
        data: profile,
      })
    } catch (error) {
      next(error)
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      // If updating avatar or banner, delete old files first
      if (req.body.avatar || req.body.banner) {
        const currentUser = await User.findById(req.user._id)
        if (currentUser) {
          // Delete old avatar if being updated
          if (req.body.avatar && currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
            const oldAvatarFileName = currentUser.avatar.replace('/uploads/', '')
            const oldAvatarFullPath = path.join('uploads', oldAvatarFileName)
            if (fs.existsSync(oldAvatarFullPath)) {
              try {
                fs.unlinkSync(oldAvatarFullPath)
                console.log(`Deleted old avatar file: ${oldAvatarFullPath}`)
              } catch (deleteError) {
                console.error('Error deleting old avatar file:', deleteError)
              }
            }
          }
          
          // Delete old banner if being updated
          if (req.body.banner && currentUser.banner && currentUser.banner.startsWith('/uploads/')) {
            const oldBannerFileName = currentUser.banner.replace('/uploads/', '')
            const oldBannerFullPath = path.join('uploads', oldBannerFileName)
            if (fs.existsSync(oldBannerFullPath)) {
              try {
                fs.unlinkSync(oldBannerFullPath)
                console.log(`Deleted old banner file: ${oldBannerFullPath}`)
              } catch (deleteError) {
                console.error('Error deleting old banner file:', deleteError)
              }
            }
          }
        }
      }

      const profile = await userService.updateProfile(req.user._id, req.body)
      res.json({
        success: true,
        data: profile,
      })
    } catch (error) {
      next(error)
    }
  },

  getStats: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user._id
      const stats = await userService.getUserStats(userId)
      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },

  uploadImage: async (req, res, next) => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded')
      }

      const type = req.params.type // 'avatar' or 'banner'
      if (!['avatar', 'banner'].includes(type)) {
        throw new Error('Invalid upload type')
      }

      // Get current user to find old file path
      const currentUser = await User.findById(req.user._id)
      if (!currentUser) {
        throw new Error('User not found')
      }

      // Delete old file if it exists
      const oldFilePath = currentUser[type]
      if (oldFilePath && oldFilePath.startsWith('/uploads/')) {
        // Extract filename from path (remove /uploads/ prefix)
        const oldFileName = oldFilePath.replace('/uploads/', '')
        const oldFileFullPath = path.join('uploads', oldFileName)
        
        // Check if file exists and delete it
        if (fs.existsSync(oldFileFullPath)) {
          try {
            fs.unlinkSync(oldFileFullPath)
            console.log(`Deleted old ${type} file: ${oldFileFullPath}`)
          } catch (deleteError) {
            // Log error but don't fail the upload if deletion fails
            console.error(`Error deleting old ${type} file:`, deleteError)
          }
        }
      }

      const filePath = `/uploads/${req.file.filename}`

      // Update user in DB
      const updateData = {}
      updateData[type] = filePath

      const updatedUser = await userService.updateProfile(req.user._id, updateData)

      res.json({
        success: true,
        data: updatedUser,
        message: 'Image uploaded successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}


