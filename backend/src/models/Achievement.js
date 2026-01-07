import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['anime', 'series', 'movies', 'animeMovies', 'manga'],
      // Note: manhwa has been merged into manga category
      index: true,
    },
    tier: {
      type: String,
      required: true,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    },
    progress: {
      type: Number,
      required: true,
      default: 0,
    },
    target: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure one achievement per category/tier per user
achievementSchema.index({ userId: 1, category: 1, tier: 1 }, { unique: true })

const Achievement = mongoose.model('Achievement', achievementSchema)

export default Achievement

