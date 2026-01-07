import { authService } from '../services/authService.js'
import { generateToken } from '../config/jwt.js'

export const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      res.json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  },

  logout: async (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  },

  getMe: async (req, res) => {
    res.json({
      success: true,
      user: req.user,
    })
  },

  googleCallback: async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=auth_failed`
        )
      }

      const user = req.user
      const token = generateToken(user._id)
      
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?token=${token}`
      )
    } catch (error) {
      console.error('Google OAuth callback error:', error)
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=auth_failed`
      )
    }
  },
}
