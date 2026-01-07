import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    
    // Provide helpful error messages
    if (error.code === 'ENODATA' || error.code === 'ETIMEDOUT') {
      console.error('\n🔍 Troubleshooting steps:')
      console.error('1. Check your internet connection')
      console.error('2. Verify MongoDB Atlas cluster is running (not paused)')
      console.error('3. Check if your IP address is whitelisted in MongoDB Atlas')
      console.error('4. Verify the MONGODB_URI in your .env file is correct')
      console.error('5. Try using a local MongoDB instance: mongodb://localhost:27017/movieo')
    }
    
    throw error
  }
}


