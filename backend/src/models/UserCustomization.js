import mongoose from 'mongoose'

const userCustomizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mediaId: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      required: true,
      enum: ['movie', 'tv', 'anime', 'manga'],
      // Note: manhwa is stored as 'manga' in the database
    },
    customBackground: {
      type: String,
      default: null,
    },
    customPoster: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

userCustomizationSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true })

const UserCustomization = mongoose.model('UserCustomization', userCustomizationSchema)

export default UserCustomization


