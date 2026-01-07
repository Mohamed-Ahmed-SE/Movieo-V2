import UserCustomization from '../models/UserCustomization.js'

export const customizationController = {
  getCustomization: async (req, res, next) => {
    try {
      const { mediaId } = req.params
      const { type } = req.query

      // Normalize manhwa to manga for database queries (manhwa is stored as manga in DB)
      const queryType = type === 'manhwa' ? 'manga' : type

      const customization = await UserCustomization.findOne({
        userId: req.user._id,
        mediaId,
        mediaType: queryType,
      })

      res.json({
        success: true,
        data: customization || { customBackground: null, customPoster: null },
      })
    } catch (error) {
      console.error('Error fetching customization:', error)
      next(error)
    }
  },

  updateCustomization: async (req, res, next) => {
    try {
      const { mediaId } = req.params
      const { type, customBackground, customPoster } = req.body

      // Normalize manhwa to manga for database queries (manhwa is stored as manga in DB)
      const queryType = type === 'manhwa' ? 'manga' : type

      const customization = await UserCustomization.findOneAndUpdate(
        {
          userId: req.user._id,
          mediaId,
          mediaType: queryType,
        },
        {
          customBackground,
          customPoster,
        },
        {
          new: true,
          upsert: true,
        }
      )

      res.json({
        success: true,
        data: customization,
      })
    } catch (error) {
      console.error('Error updating customization:', error)
      next(error)
    }
  },
  getAllCustomizations: async (req, res, next) => {
    try {
      const customizations = await UserCustomization.find({
        userId: req.user._id,
      })

      // Convert array to object map for easier frontend lookup: { [mediaId]: customization }
      const customizationMap = customizations.reduce((acc, curr) => {
        acc[curr.mediaId] = curr
        return acc
      }, {})

      res.json({
        success: true,
        data: customizationMap,
      })
    } catch (error) {
      next(error)
    }
  },
}


