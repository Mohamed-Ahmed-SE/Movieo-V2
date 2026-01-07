import express from 'express'
import { achievementsController } from '../controllers/achievementsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get all achievements for the authenticated user
router.get('/', authenticate, achievementsController.getUserAchievements)

// Check and update achievements (all categories or specific category)
router.post('/check', authenticate, achievementsController.checkAchievements)
router.post('/check/:category', authenticate, achievementsController.checkAchievements)

export default router

