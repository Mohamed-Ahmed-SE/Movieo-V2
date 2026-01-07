import User from '../models/User.js'
import { generateToken } from '../config/jwt.js'

export const authService = {
  register: async (userData) => {
    const { email, username, password } = userData

    if (!email || !username || !password) {
      const error = new Error('Email, username, and password are required')
      error.statusCode = 400
      throw error
    }

    if (password.length < 8) {
      const error = new Error('Password must be at least 8 characters long')
      error.statusCode = 400
      throw error
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      if (existingUser.email === email) {
        const error = new Error('Email already registered')
        error.statusCode = 409
        throw error
      } else {
        const error = new Error('Username already taken')
        error.statusCode = 409
        throw error
      }
    }

    try {
      const user = await User.create({
        email,
        username,
        password,
      })

      const token = generateToken(user._id)

      return {
        user: user.toJSON(),
        token,
      }
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]
        const errorMsg = new Error(`${field === 'email' ? 'Email' : 'Username'} already exists`)
        errorMsg.statusCode = 409
        throw errorMsg
      }
      throw error
    }
  },

  login: async (email, password) => {
    if (!email || !password) {
      const error = new Error('Email and password are required')
      error.statusCode = 400
      throw error
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      const error = new Error('Please sign in with Google')
      error.statusCode = 401
      throw error
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    const token = generateToken(user._id)

    return {
      user: user.toJSON(),
      token,
    }
  },
}
