import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Layout from './components/layout/Layout'
import SkeletonLoader from './components/common/SkeletonLoader'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'
import { setCredentials } from './store/slices/authSlice'
import Lenis from 'lenis'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Explore = lazy(() => import('./pages/Explore'))
const MoviesExplore = lazy(() => import('./pages/explore/MoviesExplore'))
const AnimeExplore = lazy(() => import('./pages/explore/AnimeExplore'))
const MangaExplore = lazy(() => import('./pages/explore/MangaExplore'))
const Search = lazy(() => import('./pages/Search'))
const Details = lazy(() => import('./pages/DetailsPage'))
const EpisodePage = lazy(() => import('./pages/EpisodePage'))
const Characters = lazy(() => import('./pages/Characters'))
const PersonPage = lazy(() => import('./pages/PersonPage'))
const Library = lazy(() => import('./pages/Library'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Callback = lazy(() => import('./pages/Auth/Callback'))
const NewsDetails = lazy(() => import('./pages/NewsDetails'))

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    if (token && user) {
      dispatch(setCredentials({ token, user }))
    }
    setIsAuthChecked(true)
  }, [dispatch])
  // Smooth Scroll Setup - Disabled to prevent scroll jumping
  // useEffect(() => {
  //   const lenis = new Lenis({
  //     duration: 1.2,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  //     direction: 'vertical',
  //     gestureDirection: 'vertical',
  //     smooth: true,
  //     mouseMultiplier: 1,
  //     smoothTouch: false,
  //     touchMultiplier: 2,
  //   })

  //   function raf(time) {
  //     lenis.raf(time)
  //     requestAnimationFrame(raf)
  //   }

  //   requestAnimationFrame(raf)

  //   return () => {
  //     lenis.destroy()
  //   }
  // }, [])

  if (!isAuthChecked) return null // Or a loader

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      }
    >
      <Layout>
        <ScrollToTop />
        <Routes>
          {/* Public / Landing Logic */}
          <Route path="/" element={isAuthenticated ? <Home /> : <LandingPage />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Navigate to="/explore/movie" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore/:type"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/news/:id" element={<ProtectedRoute><NewsDetails /></ProtectedRoute>} />
          <Route path="/:type/:id" element={<ProtectedRoute><Details /></ProtectedRoute>} />
          <Route path="/:type/:id/episodes" element={<ProtectedRoute><EpisodePage /></ProtectedRoute>} />
          <Route path="/:type/:id/characters" element={<ProtectedRoute><Characters /></ProtectedRoute>} />
          <Route path="/person/:id" element={<ProtectedRoute><PersonPage /></ProtectedRoute>} /> {/* Added PersonPage route */}
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Navigate to="/library" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId?"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/callback" element={<Callback />} />
        </Routes>
      </Layout>
    </Suspense>
  )
}

export default App
