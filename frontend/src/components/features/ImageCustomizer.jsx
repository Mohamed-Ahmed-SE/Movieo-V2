import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Check, Image as ImageIcon, Film, Palette, Sparkles } from 'lucide-react'
import { customizationService } from '../../services/customizationService'
import { setCustomization } from '../../store/slices/customizationSlice'
import { openModal } from '../../store/slices/uiSlice'
import Button from '../common/Button'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

const ImageCustomizerModal = ({ open, onOpenChange, media, images = [], posters = [] }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const [step, setStep] = useState('select') // 'select' or 'choose'
  const [selectedType, setSelectedType] = useState(null) // 'poster' or 'background'
  const [selectedBackground, setSelectedBackground] = useState(null)
  const [selectedPoster, setSelectedPoster] = useState(null)
  const [loading, setLoading] = useState(false)
  const customizations = useSelector((state) => state.customization.customizations)

  const mediaId = media?.id || media?.mediaId
  const mediaType = media?.type || media?.mediaType

  useEffect(() => {
    if (open) {
      setStep('select')
      setSelectedType(null)
      // Initialize with current values
      if (customizations[mediaId]) {
        setSelectedBackground(customizations[mediaId].customBackground || media.backdrop || media.bannerImage)
        setSelectedPoster(customizations[mediaId].customPoster || media.poster || media.coverImage)
      } else {
        setSelectedBackground(media.backdrop || media.bannerImage)
        setSelectedPoster(media.poster || media.coverImage)
      }
    }
  }, [open, mediaId, customizations, media])

  const handleSave = async () => {
    if (!isAuthenticated) {
      dispatch(openModal({ modalName: 'guestAction' }))
      return
    }

    setLoading(true)
    try {
      const result = await customizationService.updateCustomization(mediaId, mediaType, {
        customBackground: selectedBackground,
        customPoster: selectedPoster,
      })

      dispatch(
        setCustomization({
          mediaId,
          customization: result.data,
        })
      )
      onOpenChange(false)
      // Reset to initial state
      setStep('select')
      setSelectedType(null)
    } catch (error) {
      console.error('Error updating customization:', error)
      alert('Failed to save customization. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setStep('choose')
  }

  const handleBack = () => {
    setStep('select')
    setSelectedType(null)
  }

  // Construct valid image URLs if they are partial paths
  const getUrl = (path) => {
    if (!path) return ''
    // Handle both string paths and object paths
    const pathStr = typeof path === 'string' ? path : (path?.fullPath || path?.file_path || path?.filePath || '')
    if (!pathStr) return ''
    if (typeof pathStr === 'string' && pathStr.startsWith('http')) return pathStr
    // Ensure path starts with / for TMDB URLs
    const cleanPath = typeof pathStr === 'string' && pathStr.startsWith('/') ? pathStr : `/${pathStr}`
    return `https://image.tmdb.org/t/p/w500${cleanPath}`
  }

  // Get all available images from the images prop (which includes backdrops and posters from API)
  const imageBackdrops = images?.backdrops || images || []
  const imagePosters = images?.posters || posters || []
  
  // Extract full paths from image objects - ensure they're strings
  const backdropPaths = Array.isArray(imageBackdrops) 
    ? imageBackdrops.map(img => {
        if (typeof img === 'string') return img
        return img?.fullPath || img?.file_path || img?.filePath || null
      }).filter(Boolean)
    : []
  const posterPaths = Array.isArray(imagePosters)
    ? imagePosters.map(img => {
        if (typeof img === 'string') return img
        return img?.fullPath || img?.file_path || img?.filePath || null
      }).filter(Boolean)
    : []
  
  // Helper to extract string from value (handles objects and strings)
  const extractPath = (value) => {
    if (!value) return null
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      return value?.fullPath || value?.file_path || value?.filePath || value?.large || value?.extraLarge || null
    }
    return null
  }
  
  // Deduplicate and combine - include media's own images and all API images
  // Ensure all values are strings
  const availableBackgrounds = [...new Set([
    extractPath(media.backdrop),
    extractPath(media.bannerImage),
    // For manga/manhwa, also use coverImage as backdrop option
    (media.type === 'manga' || media.type === 'manhwa') ? extractPath(media.poster) : null,
    (media.type === 'manga' || media.type === 'manhwa') ? extractPath(media.coverImage) : null,
    ...backdropPaths
  ])].filter(Boolean)
  
  const availablePosters = [...new Set([
    extractPath(media.poster),
    extractPath(media.coverImage),
    ...posterPaths
  ])].filter(Boolean)

  if (!isAuthenticated && open) {
    onOpenChange(false)
    dispatch(openModal({ modalName: 'guestAction' }))
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn(
          "fixed inset-0 z-50 bg-black/90 backdrop-blur-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )} />
        <Dialog.Content className={cn(
          // Mobile: Full screen
          "fixed inset-0 sm:inset-auto z-50",
          // Desktop: Centered modal
          "sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
          // Size
          "w-full sm:w-[90vw] md:w-full sm:max-w-5xl",
          "h-full sm:h-auto sm:max-h-[90vh]",
          // Design
          "rounded-none sm:rounded-xl md:rounded-2xl",
          "bg-zinc-950/95 backdrop-blur-xl",
          "border border-white/10",
          "shadow-2xl",
          "p-0 overflow-hidden flex flex-col",
          // Animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]",
          "sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]"
        )}>

          {/* Header */}
          <div className="relative p-3 sm:p-4 md:p-6 border-b border-white/10 bg-gradient-to-r from-zinc-900/50 to-transparent">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                {step === 'choose' && (
                  <button 
                    onClick={handleBack} 
                    className="text-zinc-400 hover:text-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-white/5 transition-all flex items-center gap-1 sm:gap-2 group flex-shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 rotate-45 group-hover:rotate-0 transition-transform" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                <div className="min-w-0">
                  <Dialog.Title className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                    <span className="truncate">Customize Artwork</span>
                  </Dialog.Title>
                  <Dialog.Description className="text-zinc-400 text-xs sm:text-sm mt-1 truncate">
                    {step === 'select' ? 'Choose what to customize' : `Select ${selectedType === 'poster' ? 'Poster' : 'Background'} Image`}
                  </Dialog.Description>
                </div>
              </div>
              <button 
                onClick={() => onOpenChange(false)} 
                className="text-zinc-400 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-all flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4 sm:space-y-6 md:space-y-8">
            {step === 'select' ? (
              // Step 1: Choose type
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">What would you like to customize?</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto px-2">Choose between customizing the poster or background image for this title</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-3xl mx-auto">
                  <button
                    onClick={() => handleTypeSelect('poster')}
                    className="group relative h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-white/10 hover:border-primary transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Film className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary group-hover:scale-110 transition-transform relative z-10" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">Poster</h4>
                        <p className="text-xs sm:text-sm text-zinc-400">Customize the poster image</p>
                      </div>
                    </div>
                    {selectedPoster && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        Custom
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => handleTypeSelect('background')}
                    className="group relative h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-white/10 hover:border-primary transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary group-hover:scale-110 transition-transform relative z-10" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">Background</h4>
                        <p className="text-xs sm:text-sm text-zinc-400">Customize the background image</p>
                      </div>
                    </div>
                    {selectedBackground && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        Custom
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Choose image based on selected type
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 flex items-center gap-1 sm:gap-2">
                      <span className="w-1 sm:w-1.5 h-6 sm:h-8 bg-primary rounded-full flex-shrink-0"></span>
                      <span className="truncate">Select {selectedType === 'poster' ? 'Poster' : 'Background'}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">Choose from available images below</p>
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-500 flex-shrink-0">
                    {selectedType === 'background' 
                      ? `${availableBackgrounds.length} available`
                      : `${availablePosters.length} available`
                    }
                  </div>
                </div>
                {selectedType === 'background' ? (
                  availableBackgrounds.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      {availableBackgrounds.map((img, idx) => {
                        const isSelected = selectedBackground === img
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedBackground(img)}
                            className={`relative aspect-video rounded-xl overflow-hidden group transition-all duration-300 ${
                              isSelected 
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 scale-[1.02] shadow-lg shadow-primary/30' 
                                : 'hover:scale-[1.02] hover:ring-2 hover:ring-white/20'
                            }`}
                          >
                            <img 
                              src={getUrl(img)} 
                              alt="background" 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                <div className="bg-primary rounded-full p-2 shadow-lg">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
                                Selected
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-white/10">
                      <ImageIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-500 font-medium">No alternate backgrounds available</p>
                    </div>
                  )
                ) : (
                  availablePosters.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                      {availablePosters.map((img, idx) => {
                        const isSelected = selectedPoster === img
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedPoster(img)}
                            className={`relative aspect-[2/3] rounded-xl overflow-hidden group transition-all duration-300 ${
                              isSelected 
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 scale-[1.05] shadow-lg shadow-primary/30' 
                                : 'hover:scale-[1.03] hover:ring-2 hover:ring-white/20'
                            }`}
                          >
                            <img 
                              src={getUrl(img)} 
                              alt="poster" 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                <div className="bg-primary rounded-full p-2 shadow-lg">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
                                Selected
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-white/10">
                      <Film className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-500 font-medium">No alternate posters available</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {step === 'choose' && (
            <div className="p-3 sm:p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 bg-gradient-to-r from-zinc-900/50 to-transparent backdrop-blur-sm">
              <button 
                onClick={handleBack}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all hover:bg-white/5"
              >
                Back
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (selectedType === 'background') {
                      setSelectedBackground(media.backdrop || media.bannerImage)
                    } else {
                      setSelectedPoster(media.poster || media.coverImage)
                    }
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all hover:bg-white/5"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] sm:min-w-[140px] justify-center shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ImageCustomizerModal
