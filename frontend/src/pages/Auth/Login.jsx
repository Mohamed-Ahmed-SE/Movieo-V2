import * as Label from '@radix-ui/react-label'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePageTransition } from '../../hooks/useGSAP'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'
import AuthLayout from '../../components/auth/AuthLayout'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/cn'

const Login = () => {
  usePageTransition()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (loading) return
    
    setError('')
    setLoading(true)

    try {
      await login(formData)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    authService.googleLogin()
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label.Root className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 ml-1">Email Address</Label.Root>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-zinc-900/50 border border-white/10 py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-zinc-900 focus:ring-1 focus:ring-primary/50 transition-all font-sans placeholder:text-zinc-700"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <Label.Root className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Password</Label.Root>
            <Link to="/forgot-password" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">
              FORGOT PASSWORD?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full bg-zinc-900/50 border border-white/10 py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-zinc-900 focus:ring-1 focus:ring-primary/50 transition-all font-sans placeholder:text-zinc-700"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all mt-2 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 space-y-5">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-black px-3 text-zinc-600">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-sm font-bold text-zinc-300 bg-transparent group"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Google
        </button>

        <p className="text-center text-xs text-zinc-500 font-sans">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-bold hover:text-primary transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
