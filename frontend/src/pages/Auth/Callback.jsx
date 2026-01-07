import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setCredentials } from '../../store/slices/authSlice'

const Callback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    
    if (error) {
      navigate(`/login?error=${error}`)
      return
    }
    
    if (token) {
      // Fetch user data with the token
      // We'll store the token temporarily to make the request
      const tempApi = axios.create({
        baseURL: '/api',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      tempApi
        .get('/auth/me')
        .then((response) => {
          dispatch(
            setCredentials({
              token,
              user: response.data.user,
            })
          )
          navigate('/')
        })
        .catch((error) => {
          console.error('Error fetching user:', error)
          navigate('/login?error=auth_failed')
        })
    } else {
      navigate('/login?error=auth_failed')
    }
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}

export default Callback
