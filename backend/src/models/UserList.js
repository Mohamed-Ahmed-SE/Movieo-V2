import mongoose from 'mongoose'

const userListSchema = new mongoose.Schema(
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
      enum: ['movie', 'tv', 'anime', 'manga', 'manhwa'],
      // Note: manhwa is normalized to 'manga' when saving (for backward compatibility, enum still includes 'manhwa')
    },
    listType: {
      type: String,
      required: true,
      enum: ['watching', 'completed', 'planned', 'dropped', 'onHold'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    posterUrl: {
      type: String,
      default: null,
    },
    backdropUrl: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    overview: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    original_language: {
      type: String,
      default: null,
    },
    origin_country: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

userListSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true })

const UserList = mongoose.model('UserList', userListSchema)

export default UserList


