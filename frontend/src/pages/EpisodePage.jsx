import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/useGSAP'
import { useSelector, useDispatch } from 'react-redux'
import { setLists, addToList, removeFromList } from '../store/slices/userListsSlice'
import SkeletonLoader from '../components/common/SkeletonLoader'
import { mediaService } from '../services/mediaService'
import { listsService } from '../services/listsService'
import { ArrowLeft, Calendar, Clock, Check, Play, BookOpen } from 'lucide-react'
import { normalizeMediaItem } from '../utils/mediaHelpers'

const EpisodePage = () => {
  usePageTransition()
  const { type, id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const userLists = useSelector((state) => state.userLists?.lists) || {}
  const seasonNumber = parseInt(searchParams.get('season')) || 1
  const episodeNumber = parseInt(searchParams.get('episode'))
  const isChapters = searchParams.get('chapters') === 'true' || type === 'manga' || type === 'manhwa'

  const [loading, setLoading] = useState(true)
  const [episodes, setEpisodes] = useState([])
  const [showDetails, setShowDetails] = useState(null)
  const [watchedEpisodes, setWatchedEpisodes] = useState(new Set())
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch show details for context (title, backdrop)
        const detailsData = await mediaService.getDetails(type, id)
        const normalizedDetails = normalizeMediaItem(detailsData)
        setShowDetails(normalizedDetails)

        // Generate episodes/chapters based on type
        let episodesArray = []
        
        if (type === 'anime' || type === 'manga' || type === 'manhwa') {
          // For anime/manga/manhwa, generate episodes/chapters
          const total = isChapters 
            ? (normalizedDetails.totalChapters || normalizedDetails.chapters || 0)
            : (normalizedDetails.totalEpisodes || normalizedDetails.episodes || 0)
          
          const episodeImage = normalizedDetails.poster || normalizedDetails.coverImage?.large || normalizedDetails.coverImage?.extraLarge || null
          
          episodesArray = Array.from({ length: total }, (_, i) => ({
            id: i + 1,
            episode_number: i + 1,
            episodeNumber: i + 1,
            chapter_number: i + 1,
            name: isChapters ? `Chapter ${i + 1}` : `Episode ${i + 1}`,
            title: isChapters ? `Chapter ${i + 1}` : `Episode ${i + 1}`,
            overview: `${isChapters ? 'Chapter' : 'Episode'} ${i + 1} of ${normalizedDetails.title || normalizedDetails.name}`,
            still_path: episodeImage,
            still: episodeImage,
            runtime: null,
            duration: null
          }))
        } else {
          // For TV shows, fetch from API
          const episodesData = await mediaService.getEpisodes(type, id, seasonNumber)
          episodesArray = Array.isArray(episodesData) ? episodesData : (episodesData?.episodes || episodesData || [])
        }
        
        setEpisodes(episodesArray)

        // Load progress if authenticated
        if (isAuthenticated) {
          try {
            // Fetch user lists to get progress for this media
            const listsResponse = await listsService.getUserLists()
            const listsData = listsResponse?.data || listsResponse
            if (listsData) {
              dispatch(setLists(listsData))
            }
            
            // Check if this media is in user lists to get progress
            const allListItems = Object.values(listsData || {}).flat()
            const mediaItem = allListItems.find(item => String(item.mediaId) === String(id))
            if (mediaItem?.progress) {
              setProgress(mediaItem.progress)
              // Mark episodes/chapters as watched
              const current = isChapters 
                ? (mediaItem.progress.currentChapter || 0)
                : (mediaItem.progress.currentEpisode || 0)
              const watched = new Set()
              episodesArray.forEach(ep => {
                const num = isChapters 
                  ? (ep.chapter_number || ep.episode_number || 0)
                  : (ep.episodeNumber || ep.episode_number || 0)
                if (num > 0 && num <= current) {
                  watched.add(num)
                }
              })
              setWatchedEpisodes(watched)
            }
          } catch (error) {
            console.error('Failed to load user lists:', error)
          }
        }
      } catch (error) {
        console.error('Failed to load episodes', error)
        setEpisodes([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, id, seasonNumber, isAuthenticated, dispatch, isChapters])

  const handleMarkWatched = async (episodeNum, isWatched) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      const newWatched = new Set(watchedEpisodes)
      if (isWatched) {
        newWatched.add(episodeNum)
      } else {
        newWatched.delete(episodeNum)
      }
      setWatchedEpisodes(newWatched)

      // Ensure media is in watchlist with "watching" status
      const allListItems = Object.values(userLists).flat()
      const existingItem = allListItems.find(item => String(item.mediaId) === String(id))
      
      if (!existingItem) {
        // Add to watchlist
        const response = await listsService.addToList({
          mediaId: id,
          mediaType: type,
          listType: 'watching',
        })
        const newItem = response?.data || response
        if (newItem) {
          dispatch(addToList({ listType: 'watching', item: newItem }))
        }
      } else if (existingItem.listType !== 'watching') {
        // Update list type to watching if needed
        const response = await listsService.updateListItem(existingItem._id, {
          listType: 'watching',
        })
        const updatedItem = response?.data || response
        if (updatedItem) {
          dispatch(removeFromList({ listType: existingItem.listType, mediaId: id }))
          dispatch(addToList({ listType: 'watching', item: updatedItem }))
        }
      }

      // Update progress
      const maxWatched = Math.max(...Array.from(newWatched), 0)
      const updateData = isChapters
        ? {
            mediaId: id,
            mediaType: type,
            currentChapter: maxWatched,
            totalChapters: showDetails?.totalChapters || showDetails?.chapters || episodes.length,
          }
        : {
            mediaId: id,
            mediaType: type,
            currentEpisode: maxWatched,
            totalEpisodes: showDetails?.totalEpisodes || showDetails?.episodes || episodes.length,
          }
      
      await listsService.updateProgress(updateData)
    } catch (error) {
      console.error('Error updating progress:', error)
      setWatchedEpisodes(watchedEpisodes)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <SkeletonLoader className="h-96 w-full" />
        </div>
      </div>
    )
  }

  const backdropUrl = showDetails?.backdrop?.startsWith('http')
    ? showDetails.backdrop
    : showDetails?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${showDetails.backdrop_path}`
    : showDetails?.bannerImage || null

  const currentEpisode = episodeNumber ? episodes.find(ep => {
    const num = isChapters 
      ? (ep.chapter_number || ep.episode_number)
      : (ep.episodeNumber || ep.episode_number)
    return num === episodeNumber
  }) : null

  const titlePrefix = isChapters ? 'Chapter' : 'Episode'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Header */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {backdropUrl ? (
            <img src={backdropUrl} alt="Backdrop" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-end pb-8">
          <Link
            to={`/${type}/${id}`}
            className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Details</span>
          </Link>
          
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {showDetails?.title || showDetails?.name}
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg">
              {isChapters ? 'All Chapters' : `Season ${seasonNumber} Episodes`}
            </p>
          </div>
        </div>
      </div>

      {/* Current Episode/Chapter Details */}
      {currentEpisode && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {currentEpisode.still || currentEpisode.still_path ? (
                <div className="flex-shrink-0">
                  <img
                    src={currentEpisode.still?.startsWith('http') 
                      ? currentEpisode.still 
                      : currentEpisode.still_path?.startsWith('http')
                      ? currentEpisode.still_path
                      : `https://image.tmdb.org/t/p/w500${currentEpisode.still_path || currentEpisode.still}`}
                    alt={currentEpisode.name || `${titlePrefix} ${episodeNumber}`}
                    className="w-full sm:w-48 md:w-64 rounded-xl object-cover"
                  />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {currentEpisode.name || `${titlePrefix} ${episodeNumber}`}
                  </h2>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleMarkWatched(episodeNumber, !watchedEpisodes.has(episodeNumber))}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap rounded-lg ${
                        watchedEpisodes.has(episodeNumber)
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <Check className={`h-4 w-4 ${watchedEpisodes.has(episodeNumber) ? 'fill-green-400' : ''}`} />
                      {watchedEpisodes.has(episodeNumber) ? 'Watched' : 'Mark as Watched'}
                    </button>
                  )}
                </div>
                {currentEpisode.overview && (
                  <p className="text-zinc-300 leading-relaxed">{currentEpisode.overview}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Episodes/Chapters Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {isChapters ? 'All Chapters' : `Season ${seasonNumber} Episodes`}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {episodes.length} {isChapters ? 'chapters' : 'episodes'} total
          </p>
        </div>

        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {episodes.map((episode, index) => {
              const epNum = isChapters
                ? (episode.chapter_number || episode.episode_number || index + 1)
                : (episode.episodeNumber || episode.episode_number || index + 1)
              const isWatched = watchedEpisodes.has(epNum)
              const stillUrl = episode.still?.startsWith('http')
                ? episode.still
                : episode.still_path?.startsWith('http')
                ? episode.still_path
                : episode.still_path
                ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                : null

              return (
                <div
                  key={episode.id || epNum}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                    episodeNumber === epNum
                      ? 'border-red-500 ring-2 ring-red-500/50'
                      : isWatched
                      ? 'border-green-500/50 hover:border-green-500/80'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <Link
                    to={`/${type}/${id}/episodes?season=${seasonNumber}&episode=${epNum}${isChapters ? '&chapters=true' : ''}`}
                    className="block"
                  >
                    <div className="relative aspect-video bg-zinc-900">
                      {stillUrl ? (
                        <img
                          src={stillUrl}
                          alt={episode.name || `${titlePrefix} ${epNum}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isChapters ? (
                            <BookOpen className="h-12 w-12 text-zinc-600" />
                          ) : (
                            <Play className="h-12 w-12 text-zinc-600" />
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      {isWatched && (
                        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-2 shadow-lg">
                          <Check className="h-4 w-4 text-white fill-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">
                            {titlePrefix} {epNum}
                          </span>
                          {episode.runtime && (
                            <span className="text-xs text-zinc-400">{episode.runtime}m</span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                          {episode.name || `${titlePrefix} ${epNum}`}
                        </h3>
                      </div>
                    </div>
                  </Link>
                  {isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleMarkWatched(epNum, !isWatched)
                      }}
                      className={`absolute top-3 left-3 p-2 rounded-lg backdrop-blur-md transition-all ${
                        isWatched
                          ? 'bg-green-500/90 text-white'
                          : 'bg-black/60 text-zinc-300 hover:bg-black/80 hover:text-white'
                      }`}
                      title={isWatched ? 'Mark as Unwatched' : 'Mark as Watched'}
                    >
                      <Check className={`h-4 w-4 ${isWatched ? 'fill-white' : ''}`} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-lg">No {isChapters ? 'chapters' : 'episodes'} available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EpisodePage
