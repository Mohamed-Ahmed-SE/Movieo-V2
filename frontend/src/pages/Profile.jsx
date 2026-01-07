import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePageTransition } from '../hooks/useGSAP'
import { useSelector, useDispatch } from 'react-redux'
import { Camera, Edit2, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import { userService } from '../services/userService'
import { achievementsService } from '../services/achievementsService'
import { updateUser } from '../store/slices/authSlice'
import Button from '../components/common/Button'
import ImageCropper from '../components/common/ImageCropper'
import ProfileStats from '../components/profile/ProfileStats'
import AchievementsSection from '../components/profile/AchievementsSection'
import { cn } from '../utils/cn'
import { debounce } from '../utils/performance'

// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `http://localhost:5000${path}`
}

const Profile = () => {
  usePageTransition()
  const { userId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // If no userId param, we are viewing our own profile. 
  // If userId param matches our ID, it is also our profile.
  const isOwnProfile = !userId || (user && (user.id === userId || user._id === userId))

  const [avatarPreview, setAvatarPreview] = useState(getImageUrl(user?.avatar))
  const [bannerPreview, setBannerPreview] = useState(getImageUrl(user?.banner))
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [achievements, setAchievements] = useState(null)
  const [loadingAchievements, setLoadingAchievements] = useState(false)

  // Cropper State
  const [showCropper, setShowCropper] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const [cropType, setCropType] = useState('avatar') // 'avatar' or 'banner'

  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  useEffect(() => {
    setAvatarPreview(getImageUrl(user?.avatar))
    setBannerPreview(getImageUrl(user?.banner))
  }, [user])

  const fetchStats = async () => {
    if (user?._id || user?.id) {
      setLoadingStats(true)
      try {
        const userId = user._id || user.id
        const response = await userService.getUserStats(userId)
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }
  }

  useEffect(() => {
    fetchStats()
  }, [user])

  // Debounced refresh function for stats
  const debouncedRefreshStats = useRef(
    debounce(() => {
      if (user?._id || user?.id) {
        const userId = user._id || user.id
        userService.getUserStats(userId)
          .then(response => setStats(response.data))
          .catch(error => console.error('Failed to fetch stats:', error))
      }
    }, 500)
  ).current

  // Listen for list updates to refresh stats (debounced)
  useEffect(() => {
    const handleListUpdate = () => {
      // Debounced refresh to avoid multiple rapid API calls
      debouncedRefreshStats()
    }

    window.addEventListener('listUpdated', handleListUpdate)
    return () => {
      window.removeEventListener('listUpdated', handleListUpdate)
    }
  }, [user])

  const fetchAchievements = async () => {
    if (user?._id || user?.id) {
      setLoadingAchievements(true)
      try {
        const response = await achievementsService.getUserAchievements()
        setAchievements(response.data)
      } catch (error) {
        console.error('Failed to fetch achievements:', error)
      } finally {
        setLoadingAchievements(false)
      }
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [user])

  // Debounced refresh function for achievements
  const debouncedRefreshAchievements = useRef(
    debounce(() => {
      if (user?._id || user?.id) {
        achievementsService.getUserAchievements()
          .then(response => setAchievements(response.data))
          .catch(error => console.error('Failed to fetch achievements:', error))
      }
    }, 500)
  ).current

  // Listen for list updates to refresh achievements (debounced)
  useEffect(() => {
    const handleListUpdate = () => {
      // Debounced refresh to avoid multiple rapid API calls
      debouncedRefreshAchievements()
    }

    window.addEventListener('listUpdated', handleListUpdate)
    return () => {
      window.removeEventListener('listUpdated', handleListUpdate)
    }
  }, [user])

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropImageSrc(reader.result)
      setCropType(type)
      setShowCropper(true)
      // Reset input to allow re-selection
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob) => {
    setShowCropper(false)
    if (!croppedBlob) return

    // Create a File from Blob (timestamped name)
    const file = new File([croppedBlob], `${cropType}_${Date.now()}.jpg`, { type: 'image/jpeg' })

    // Optimistic Preview
    const previewUrl = URL.createObjectURL(croppedBlob)
    if (cropType === 'avatar') setAvatarPreview(previewUrl)
    if (cropType === 'banner') setBannerPreview(previewUrl)

    try {
      const result = await userService.uploadImage(cropType, file)
      // Dispatch Redux Update
      if (result && result.data) {
        dispatch(updateUser(result.data))

        // Update LocalStorage to persist changes across refresh
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...currentUser, ...result.data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Upload failed', error)
    }
  }

  const triggerAvatarUpload = () => isOwnProfile && avatarInputRef.current?.click()
  const triggerBannerUpload = () => isOwnProfile && bannerInputRef.current?.click()

  return (
    <div className="min-h-screen bg-black pb-20 font-sans">

      {/* Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspect={cropType === 'avatar' ? 1 : 16 / 5} // 16:5 for banner
        />
      )}

      {/* 1. Header/Banner Section */}
      <div className="relative h-48 sm:h-60 md:h-[350px] w-full group">
        {/* Banner Image */}
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Banner Upload Button */}
        {isOwnProfile && (
          <>
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'banner')}
            />
            <button
              onClick={triggerBannerUpload}
              className="absolute top-20 sm:top-24 right-4 sm:right-6 md:right-12 p-2 sm:p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-colors opacity-0 group-hover:opacity-100"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 -mt-12 sm:-mt-16 md:-mt-20">
        <div className="flex flex-row items-end gap-4 sm:gap-6">

          {/* Avatar Circle - Always on left */}
          <div className="relative group flex-shrink-0">
            <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 rounded-full bg-black p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 relative border-2 sm:border-4 border-black">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-2xl sm:text-3xl md:text-4xl font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}

                {/* Avatar Upload Overlay */}
                {isOwnProfile && (
                  <div
                    onClick={triggerAvatarUpload}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'avatar')}
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 pb-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight truncate">{user?.username || 'Guest User'}</h1>
                <p className="text-sm sm:text-base text-zinc-400 font-sans truncate">@{user?.username?.toLowerCase().replace(/\s/g, '') || 'guest'}</p>
              </div>

              {isOwnProfile && (
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white gap-2 text-sm sm:text-base whitespace-nowrap" onClick={() => { /* TODO: edit profile */ }}>
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Edit Profile</span><span className="sm:hidden">Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid - Modern Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {/* Sidebar Info - Modern Cards */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="p-5 sm:p-6 bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl space-y-4">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Joined</h3>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Location</h3>
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">Planet Earth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Modern Cards */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Statistics */}
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8">
              <ProfileStats stats={stats} />
            </div>

            {/* Achievements */}
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8">
              {loadingAchievements ? (
                <div className="p-12 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading achievements...</p>
                </div>
              ) : achievements ? (
                <AchievementsSection 
                  achievements={achievements}
                  onUnlock={(tier) => {
                    console.log('Achievement unlocked:', tier)
                  }}
                />
              ) : null}
            </div>

            {/* Activity Placeholder */}
            <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/20">
              <p className="text-sm sm:text-base">No recent activity to show.</p>
              <Button className="bg-primary text-black hover:bg-primary/90" onClick={() => navigate('/explore')}>
                Start Exploring
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

