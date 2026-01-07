import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema(
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
    currentEpisode: {
      type: Number,
      default: 0,
    },
    totalEpisodes: {
      type: Number,
      default: null,
    },
    currentChapter: {
      type: Number,
      default: 0,
    },
    totalChapters: {
      type: Number,
      default: null,
    },
    watchedMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

userProgressSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true })

const UserProgress = mongoose.model('UserProgress', userProgressSchema)

export default UserProgress


