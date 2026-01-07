import express from 'express'
import passport from 'passport'
import { authController } from '../controllers/authController.js'
import { validateRegister, validateLogin } from '../utils/validators.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import '../config/oauth.js'

const router = express.Router()

router.post('/register', validateRegister, validate, authController.register)
router.post('/login', validateLogin, validate, authController.login)
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getMe)

// OAuth routes - only register if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=auth_failed` }),
    authController.googleCallback
  )
}

export default router
