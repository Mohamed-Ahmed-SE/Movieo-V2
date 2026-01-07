import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import authRoutes from './routes/auth.routes.js'
import mediaRoutes from './routes/media.routes.js'
import userRoutes from './routes/user.routes.js'
import listsRoutes from './routes/lists.routes.js'
import customizationRoutes from './routes/customization.routes.js'
import achievementsRoutes from './routes/achievements.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/users', userRoutes)
app.use('/api/lists', listsRoutes)
app.use('/api/customization', customizationRoutes)
app.use('/api/achievements', achievementsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Movieo API is running' })
})

// Error handling
app.use(errorHandler)

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 API available at http://localhost:${PORT}/api`)
    })
  })
  .catch((error) => {
    console.error('\n❌ Failed to connect to database:', error.message)
    console.error('\n💡 Quick fixes:')
    console.error('   • If using MongoDB Atlas: Check if cluster is running (not paused)')
    console.error('   • Verify MONGODB_URI in backend/.env file')
    console.error('   • For local MongoDB: Use mongodb://localhost:27017/movieo')
    console.error('   • Check your internet connection and DNS settings')
    console.error('   • Ensure your IP is whitelisted in MongoDB Atlas Network Access')
    console.error('\n⚠️  Server cannot start without database connection.')
    process.exit(1)
  })
