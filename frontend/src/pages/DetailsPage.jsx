import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useMedia } from '../hooks/useMedia'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

// Components
import HeroSection from '../components/details/HeroSection'
import HeroSkeleton from '../components/details/skeletons/HeroSkeleton'
import AboutSection from '../components/details/AboutSection'
import EpisodesSection from '../components/details/EpisodesSection'
import CastRow from '../components/details/CastRow'
import SidebarInfo from '../components/details/SidebarInfo'
import TrailerModal from '../components/details/TrailerModal'
import HorizontalCarousel from '../components/common/HorizontalCarousel'
import MediaCardModal from '../components/features/MediaCardModal'
import ImageCustomizerModal from '../components/features/ImageCustomizer'

// Services & Redux
import { openModal } from '../store/slices/uiSlice'
import { customizationService } from '../services/customizationService'
import { setCustomization } from '../store/slices/customizationSlice'
import { mediaService } from '../services/mediaService'
import { cn } from '../utils/cn'

const DetailsPage = memo(() => {
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { type, id } = useParams()
  const { media, loading } = useMedia(type, id)

  // State
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [chapters, setChapters] = useState([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [images, setImages] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const [relatedContent, setRelatedContent] = useState([])

  // Redux
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const customizations = useSelector((state) => state.customization.customizations)
  const userLists = useSelector(state => state.userLists?.lists) || {}

  // Optimized GSAP - Hero entrance animation
  useGSAP(() => {
    if (!loading && media && containerRef.current) {
      const heroImg = containerRef.current?.querySelector('.hero-img')
      
      if (heroImg) {
        gsap.set(heroImg, { willChange: 'transform, opacity' })
        gsap.fromTo(heroImg,
          { scale: 1.1, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.6, 
            ease: 'expo.out',
            force3D: true
          }
        )
      }
    }
  }, { scope: containerRef, dependencies: [loading, media] })

  // Handlers
  const handlePlayTrailer = async () => {
    let videos = Array.isArray(media.videos) ? media.videos : (media.videos?.results || [])
    const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos.find(v => v.site === "YouTube")

    if (trailer) {
      setTrailerKey(trailer.key)
      setShowTrailer(true)
    } else {
      alert("No trailer available for this title.")
    }
  }

  const handleAddToList = () => {
    if (!isAuthenticated) {
      dispatch(openModal({ modalName: 'guestAction' }))
      return
    }
    setModalOpen(true)
  }

  const handleCustomize = () => {
    if (!isAuthenticated) {
      dispatch(openModal({ modalName: 'guestAction' }))
      return
    }
    setCustomizerOpen(true)
  }

  // Fetch customization
  useEffect(() => {
    if (isAuthenticated && media) {
      const fetchCustomization = async () => {
        try {
          const result = await customizationService.getCustomization(id, type)
          dispatch(setCustomization({
            mediaId: id,
            customization: result.data,
          }))
        } catch (error) {
          // Silent fail
        }
      }
      fetchCustomization()
    }
  }, [isAuthenticated, id, type, media, dispatch])

  // Fetch images - for all types including anime/manga/manhwa
  useEffect(() => {
    if (media && id) {
      const fetchImages = async () => {
        try {
          // Set loading state immediately to prevent title flash
          setImages({ backdrops: [], logos: [], posters: [] })
          const imagesData = await mediaService.getImages(type, id)
          setImages(imagesData)
        } catch (error) {
          console.error('Error fetching images:', error)
          // For anime/manga/manhwa, AniList doesn't provide logos, so set empty structure
          if (type === 'anime' || type === 'manga' || type === 'manhwa') {
            setImages({ backdrops: [], logos: [], posters: [] })
          }
        }
      }
      fetchImages()
    } else if (media?.images) {
      setImages(media.images)
    } else {
      // Set empty images initially to prevent title flash
      setImages({ backdrops: [], logos: [], posters: [] })
    }
  }, [media, type, id])

  // Initialize selectedSeason
  useEffect(() => {
    if (media?.seasons && media.seasons.length > 0) {
      const firstSeason = media.seasons.find(s => s.season_number !== 0) || media.seasons[0]
      if (firstSeason && selectedSeason !== firstSeason.season_number) {
        setSelectedSeason(firstSeason.season_number)
      }
    }
  }, [media?.seasons])

  // Fetch episodes
  useEffect(() => {
    // For anime, generate episodes from totalEpisodes if available
    if ((media?.type === 'anime' || type === 'anime') && media?.totalEpisodes) {
      setLoadingEpisodes(true)
      try {
        // Generate episode list for anime
        const totalEps = media.totalEpisodes || media.episodes || 0
        // Use poster/cover image as fallback for episode images
        const episodeImage = media.poster || media.coverImage?.large || media.coverImage?.extraLarge || null
        const episodesArray = Array.from({ length: totalEps }, (_, i) => ({
          id: i + 1,
          episode_number: i + 1,
          episodeNumber: i + 1,
          name: `Episode ${i + 1}`,
          title: `Episode ${i + 1}`,
          overview: `Episode ${i + 1} of ${media.title || media.name}`,
          still_path: episodeImage, // Use poster as episode image
          still: episodeImage,
          runtime: null,
          duration: null
        }))
        setEpisodes(episodesArray)
      } catch (error) {
        console.error('Error generating anime episodes:', error)
        setEpisodes([])
      } finally {
        setLoadingEpisodes(false)
      }
    }
    // For TV shows, fetch episodes from API
    else if ((media?.type === 'tv' || type === 'tv') && id && selectedSeason && media?.seasons) {
      const fetchEpisodes = async () => {
        setLoadingEpisodes(true)
        try {
          const episodesData = await mediaService.getEpisodes(type, id, selectedSeason)
          
          let episodesArray = []
          if (Array.isArray(episodesData)) {
            episodesArray = episodesData
          } else if (episodesData?.episodes) {
            episodesArray = episodesData.episodes
          } else if (episodesData?.data) {
            episodesArray = Array.isArray(episodesData.data) ? episodesData.data : []
          }
          
          episodesArray = episodesArray.map(ep => ({
            ...ep,
            episode_number: ep.episode_number || ep.episodeNumber || 0,
            still_path: ep.still_path || ep.still || null,
            name: ep.name || ep.title || `Episode ${ep.episode_number || ep.episodeNumber || 0}`,
            runtime: ep.runtime || ep.duration || null
          }))
          
          setEpisodes(episodesArray)
        } catch (error) {
          console.error('Error fetching episodes:', error)
          setEpisodes([])
        } finally {
          setLoadingEpisodes(false)
        }
      }
      fetchEpisodes()
    } else {
      setEpisodes([])
    }
  }, [type, id, selectedSeason, media])

  // Fetch/generate chapters for manga/manhwa
  useEffect(() => {
    // For manga/manhwa, generate chapters from totalChapters if available
    if (media?.type === 'manga' || media?.type === 'manhwa' || type === 'manga' || type === 'manhwa') {
      setLoadingChapters(true)
      try {
        // Get total chapters - check multiple possible field names
        // AniList returns chapters, but it might be in different formats
        // Also check if chapters is 0 (which is different from null)
        let totalChaps = null
        if (media?.totalChapters !== undefined && media?.totalChapters !== null) {
          totalChaps = media.totalChapters
        } else if (media?.chapters !== undefined && media?.chapters !== null) {
          totalChaps = media.chapters
        } else if (media?.number_of_chapters !== undefined && media?.number_of_chapters !== null) {
          totalChaps = media.number_of_chapters
        }
        
        // Debug log to see what we're getting - always log for debugging
        console.log('Manga/Manhwa chapters data:', {
          type: media?.type || type,
          id: media?.id || id,
          title: media?.title || media?.name,
          totalChapters: media?.totalChapters,
          chapters: media?.chapters,
          number_of_chapters: media?.number_of_chapters,
          status: media?.status,
          totalChaps,
          hasMedia: !!media,
          mediaType: media?.type,
          allMediaKeys: media ? Object.keys(media).filter(k => k.toLowerCase().includes('chapter') || k.toLowerCase().includes('status')) : [],
          fullMedia: media // Log full media object to see what's actually there
        })
        
        // Accept estimated chapters or actual chapters
        if (totalChaps && totalChaps > 0 && !isNaN(totalChaps)) {
          // Use poster/cover image as fallback for chapter images
          const chapterImage = media.poster || media.coverImage?.large || media.coverImage?.extraLarge || null
          const chaptersArray = Array.from({ length: totalChaps }, (_, i) => ({
            id: i + 1,
            chapter_number: i + 1,
            episode_number: i + 1, // For compatibility with EpisodesSection
            episodeNumber: i + 1,
            name: `Chapter ${i + 1}`,
            title: `Chapter ${i + 1}`,
            overview: `Chapter ${i + 1} of ${media.title || media.name}`,
            still_path: chapterImage, // Use poster as chapter image
            still: chapterImage,
            runtime: null,
            duration: null
          }))
          setChapters(chaptersArray)
        } else {
          // No chapters available - check if it's an ongoing series
          // For ongoing series, we might not have chapter count from AniList
          console.warn(`No chapter count available for ${media?.title || media?.name || 'this manga'}. AniList may not provide chapter counts for ongoing series.`)
          setChapters([])
        }
      } catch (error) {
        console.error('Error generating chapters:', error)
        setChapters([])
      } finally {
        setLoadingChapters(false)
      }
    } else {
      setChapters([])
    }
  }, [type, id, media])

  // Related content - fetch separately if not in media object with better fallbacks
  useEffect(() => {
    const fetchRelatedContent = async () => {
      if (!media) {
        setRelatedContent([])
        return
      }

      let formatted = []

      // First check if recommendations/similar are already in media (TMDB format)
      const tmdbRecs = media?.recommendations?.results || media?.recommendations || []
      const tmdbSimilar = media?.similar?.results || media?.similar || []
      const existing = [...tmdbRecs, ...tmdbSimilar]
      
      if (existing.length > 0) {
        formatted = existing
          .map(rec => {
            let posterPath = rec.poster_path || rec.poster
            if (posterPath && !posterPath.startsWith('http')) {
              if (posterPath.startsWith('/')) {
                posterPath = `https://image.tmdb.org/t/p/w500${posterPath}`
              }
            }
            
            return {
              id: rec.id,
              title: rec.title || rec.name,
              poster_path: posterPath,
              poster: posterPath,
              coverImage: posterPath ? { large: posterPath, extraLarge: posterPath } : null,
              vote_average: rec.vote_average || rec.rating,
              type: rec.mediaType || rec.type || type,
              mediaType: rec.mediaType || rec.type || type,
            }
          })
          .filter(item => item && item.poster_path && item.poster_path !== null)
      }

      // For AniList content, use relations as fallback
      if (formatted.length === 0 && (type === 'anime' || type === 'manga' || type === 'manhwa')) {
        const relations = media.relations || []
        if (Array.isArray(relations) && relations.length > 0) {
          formatted = relations
            .map(rel => {
              const mediaItem = rel.node || rel.media || rel
              if (!mediaItem || !mediaItem.id) return null
              
              const posterUrl = mediaItem.coverImage?.large || mediaItem.coverImage?.extraLarge || mediaItem.poster || mediaItem.poster_path
              if (!posterUrl) return null
              
              const backdropUrl = mediaItem.bannerImage || mediaItem.coverImage?.extraLarge || null
              
              return {
                id: mediaItem.id.toString(),
                title: mediaItem.title?.english || mediaItem.title?.romaji || mediaItem.title?.userPreferred || mediaItem.title || mediaItem.name,
                poster_path: posterUrl,
                poster: posterUrl,
                backdrop_path: backdropUrl,
                backdrop: backdropUrl,
                coverImage: { large: posterUrl, extraLarge: posterUrl },
                vote_average: mediaItem.averageScore ? mediaItem.averageScore / 10 : (mediaItem.rating || mediaItem.vote_average || null),
                type: mediaItem.type?.toLowerCase() || type,
                mediaType: mediaItem.type?.toLowerCase() || type,
              }
            })
            .filter(item => item && item.poster_path && item.poster_path !== null)
        }
      }

      // Fallback: Fetch trending content of same type if no recommendations
      if (formatted.length === 0) {
        try {
          const trending = await mediaService.getTrending(type === 'manhwa' ? 'manga' : type)
          const trendingList = Array.isArray(trending) ? trending : (trending?.results || [])
          formatted = trendingList
            .filter(item => item.id !== media.id) // Exclude current item
            .slice(0, 20)
            .map(item => {
              const posterPath = item.poster_path || item.poster || item.coverImage?.large
              return {
                id: item.id,
                title: item.title || item.name,
                poster_path: posterPath,
                poster: posterPath,
                coverImage: posterPath ? { large: posterPath, extraLarge: posterPath } : null,
                vote_average: item.vote_average || item.rating,
                type: item.type || type,
                mediaType: item.type || type,
              }
            })
            .filter(item => item && item.poster_path)
        } catch (error) {
          console.error('Error fetching trending fallback:', error)
        }
      }

      setRelatedContent(formatted)
    }

    if (media && !loading) {
      fetchRelatedContent()
    } else {
      setRelatedContent([])
    }
  }, [media, type, loading])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <HeroSkeleton />
      </div>
    )
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Content Not Found</h2>
          <Link to="/" className="text-white hover:text-zinc-400">Go Back</Link>
        </div>
      </div>
    )
  }

  // Image URLs
  const customization = customizations[id]
  // For manga/manhwa, ensure we always have a backdrop (use coverImage if bannerImage is missing)
  const defaultBackdrop = media?.backdrop || media?.bannerImage || (media?.poster || media?.coverImage)
  const defaultPoster = media?.poster || media?.coverImage
  const displayPoster = customization?.customPoster || defaultPoster
  const displayBackdrop = customization?.customBackground || defaultBackdrop

  const getImageUrl = (path, size = 'original') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  const backdropUrl = getImageUrl(displayBackdrop, 'original')
  const posterUrl = getImageUrl(displayPoster, 'w500')
  
  // Logo URL - Try to get logo from images for all types
  const imagesData = images || media.images
  const logoFromImages = imagesData?.logos?.find(l => l.iso_639_1 === 'en') || imagesData?.logos?.[0]
  
  let logoUrl = null
  
  // First, try to get logo from images array (works for all types including anime from TMDB)
  if (logoFromImages?.fullPath) {
    logoUrl = logoFromImages.fullPath
  } else if (logoFromImages?.file_path) {
    const path = logoFromImages.file_path.startsWith('/') 
      ? logoFromImages.file_path 
      : `/${logoFromImages.file_path}`
    logoUrl = `https://image.tmdb.org/t/p/original${path}`
  }
  
  // Fallback to media.logo or media.logo_path if no logo in images array
  if (!logoUrl) {
    if (media.logo) {
      logoUrl = media.logo
    } else if (media.logo_path) {
      logoUrl = media.logo_path.startsWith('http') 
        ? media.logo_path 
        : `https://image.tmdb.org/t/p/original${media.logo_path.startsWith('/') ? media.logo_path : `/${media.logo_path}`}`
    }
  }
  
  // If still no logo, logoUrl stays null and HeroSection will show title instead

  // Check if in list
  const allListItems = Object.values(userLists).flat()
  const isInList = allListItems.some(item => String(item.mediaId) === String(media.id))

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={cn(
          "fixed top-20 sm:top-24 left-3 sm:left-6 z-50 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2",
          "bg-black/60 backdrop-blur-md hover:bg-black/80",
          "transition-all group text-xs sm:text-sm"
        )}
      >
        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium hidden sm:inline">Back</span>
      </button>

      {/* Hero Section */}
      <HeroSection
        media={media}
        backdropUrl={backdropUrl}
        logoUrl={logoUrl}
        onPlay={handlePlayTrailer}
        onAddToList={handleAddToList}
        onCustomize={handleCustomize}
        isInList={isInList}
      />

      {/* Main Content */}
      <div className="bg-black relative z-10 pt-8 sm:pt-12 md:pt-16 lg:pt-20">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8 md:space-y-12 lg:space-y-16 order-2 lg:order-1">
              <AboutSection media={media} />

              {media.characters && media.characters.length > 0 && (
                <CastRow characters={media.characters} type={type} id={id} />
              )}

              {/* Episodes Section - Show for TV (with seasons) and anime (with totalEpisodes) */}
              {((media.type === 'tv' || type === 'tv') && media?.seasons && media.seasons.length > 0) && (
                <EpisodesSection
                  episodes={episodes}
                  loading={loadingEpisodes}
                  type={type}
                  id={id}
                  selectedSeason={selectedSeason}
                  seasons={media.seasons}
                  onSeasonChange={setSelectedSeason}
                />
              )}
              {/* For anime, show EpisodesSection with generated episodes */}
              {((media.type === 'anime' || type === 'anime') && (media.totalEpisodes || media.episodes) && episodes.length > 0) && (
                <EpisodesSection
                  episodes={episodes}
                  loading={loadingEpisodes}
                  type={type}
                  id={id}
                  selectedSeason={1}
                  seasons={[]}
                  onSeasonChange={() => {}}
                  totalEpisodes={media.totalEpisodes || media.episodes}
                  showAllLimit={20}
                />
              )}
              {/* For manga/manhwa, show EpisodesSection with generated chapters */}
              {((media.type === 'manga' || media.type === 'manhwa' || type === 'manga' || type === 'manhwa') && chapters.length > 0) && (
                <EpisodesSection
                  episodes={chapters}
                  loading={loadingChapters}
                  type={type}
                  id={id}
                  selectedSeason={1}
                  seasons={[]}
                  onSeasonChange={() => {}}
                  isChapters={true}
                  totalChapters={media.totalChapters || media.chapters}
                  showAllLimit={20}
                />
              )}

              {/* You Might Like Section - Always show if we have content */}
              {relatedContent.length > 0 ? (
                <section className="overflow-hidden">
                  <HorizontalCarousel
                    title="You Might Like"
                    subtitle="Based on what you're watching"
                    media={relatedContent.slice(0, 20).map(item => ({
                      ...item,
                      backdrop_path: item.backdrop_path || item.backdrop || null,
                      backdrop: item.backdrop || item.backdrop_path || item.bannerImage || null,
                    }))}
                    showArrows={true}
                  />
                </section>
              ) : (
                // Show placeholder if no recommendations available
                <section className="py-12 text-center">
                  <p className="text-zinc-400 text-sm sm:text-base">No recommendations available at this time.</p>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 order-1 lg:order-2 mb-6 lg:mb-0">
              <SidebarInfo media={media} posterUrl={posterUrl} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TrailerModal
        isOpen={showTrailer}
        trailerKey={trailerKey}
        onClose={() => setShowTrailer(false)}
      />
      <MediaCardModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        media={{ ...media, type: media.type || type }} 
      />
      <ImageCustomizerModal
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        media={media}
        images={images}
        posters={images?.posters || []}
      />
    </div>
  )
})

DetailsPage.displayName = 'DetailsPage'

export default DetailsPage

