import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'oauthProviders.googleId': profile.id })

        if (user) {
          return done(null, user)
        }

        user = await User.findOne({ email: profile.emails[0].value })

        if (user) {
          user.oauthProviders.googleId = profile.id
          await user.save()
          return done(null, user)
        }

        // Generate unique username if duplicate
        let baseUsername = profile.displayName.replace(/\s/g, '').toLowerCase().substring(0, 20)
        let username = baseUsername
        let counter = 1
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`
          counter++
          if (counter > 1000) break // Safety limit
        }

        user = await User.create({
          email: profile.emails[0].value,
          username,
          oauthProviders: {
            googleId: profile.id,
          },
        })

        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
  )
}


passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})
