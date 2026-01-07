import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, logout } from '../store/slices/authSlice'
import { authService } from '../services/authService'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const { token, user } = response
      
      // Set in localStorage first
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Then dispatch to Redux to ensure token is available for subsequent requests
      dispatch(setCredentials({ token, user }))
      
      return response
    } catch (error) {
      // Clear any partial state on error
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      const { token, user } = response
      
      // Set in localStorage first
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Then dispatch to Redux to ensure token is available for subsequent requests
      dispatch(setCredentials({ token, user }))
      
      return response
    } catch (error) {
      // Clear any partial state on error
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error
    }
  }

  const logoutUser = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch(logout())
      navigate('/')
    }
  }

  const checkGuestAction = (action) => {
    if (!isAuthenticated) {
      // This will be handled by the component using openModal
      return false
    }
    return true
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout: logoutUser,
    checkGuestAction,
  }
}


