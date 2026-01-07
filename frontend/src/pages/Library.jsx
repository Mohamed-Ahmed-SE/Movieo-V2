import { useState, useEffect, memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { listsService } from '../services/listsService'
import { setLists } from '../store/slices/userListsSlice'
import { normalizeMediaItem, getMediaImage } from '../utils/mediaHelpers'
import { Play, Clock, Trophy, Bookmark, TrendingUp, CheckCircle2, Sparkles, Grid3x3, List as ListIcon, Filter } from 'lucide-react'
import { cn } from '../utils/cn'
import MediaCard from '../components/features/MediaCard'

// Library Row Card Component (Improved)
const LibraryRowCard = memo(({ item }) => {
  const navigate = useNavigate()

  // Get poster with proper formatting
  const posterPath = item.poster_path || item.poster
  let poster = null
  if (posterPath) {
    if (posterPath.startsWith('http')) {
      poster = posterPath
    } else if (posterPath.startsWith('/')) {
      poster = `https://image.tmdb.org/t/p/w500${posterPath}`
    } else {
      poster = getMediaImage(item, 'poster')
    }
  } else {
    poster = getMediaImage(item, 'poster')
  }

  const isSeries = item.mediaType === 'tv' || item.mediaType === 'anime'

  // Calculate progress
  const currentEpisode = item.progress?.currentEpisode || item.currentEpisode || 0
  const totalEpisodes = item.totalEpisodes || item.episodes || item.number_of_episodes || 0
  const progressPercent = totalEpisodes > 0 ? (currentEpisode / totalEpisodes) * 100 : 0
  const episodesLeft = totalEpisodes - currentEpisode

  const handleClick = () => {
    navigate(`/${item.mediaType || 'movie'}/${item.mediaId || item.id}`)
  }

  // Get title from normalized item
  const title = item.title || item.name || 'Untitled'
  // Get description from normalized item
  const description = item.overview || item.description || ''

  return (
    <div
      onClick={handleClick}
      className="bg-zinc-900/40 border border-white/5 overflow-hidden hover:bg-zinc-900/60 hover:border-white/10 transition-all cursor-pointer group"
    >
      <div className="flex gap-3 sm:gap-4 p-2 sm:p-3 h-28 sm:h-36">
        {/* Poster */}
        <div className="flex-shrink-0 w-[4.5rem] sm:w-24 h-full aspect-[2/3] overflow-hidden bg-zinc-800 shadow-lg relative">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-zinc-800"
            style={{ display: poster ? 'none' : 'flex' }}
          >
            <span className="text-2xl">🎬</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
          {/* Header: Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {(item.rating || item.vote_average) && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-500 font-medium bg-yellow-500/10 px-1.5 py-0.5 rounded ml-auto shrink-0">
                <span>⭐</span>
                {(item.rating || item.vote_average).toFixed(1)}
              </span>
            )}
          </div>

          {/* Progress Bar (Compact) */}
          {isSeries && totalEpisodes > 0 && (
            <div className="mb-2 w-full max-w-sm">
              <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs">
                <span className="text-zinc-400">
                  Ep {currentEpisode} <span className="text-zinc-600">/</span> {totalEpisodes}
                </span>
                <span className="text-zinc-500">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Description or Metadata */}
          <div className="flex-1 min-h-0 mb-1">
            {description ? (
              <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {description.replace(/<[^>]+>/g, '')}
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs text-zinc-600 italic">
                No description available.
              </p>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-zinc-500 mt-auto">
            <span className="uppercase tracking-wider font-medium text-zinc-400">
              {item.mediaType || 'Media'}
            </span>
            {item.releaseDate && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-zinc-600" />
                <span>{new Date(item.releaseDate).getFullYear()}</span>
              </>
            )}
            {/* Status indicator can go here if needed */}
          </div>
        </div>
      </div>
    </div>
  )
})

LibraryRowCard.displayName = 'LibraryRowCard'

// Empty State Component
const EmptyState = memo(({ tab, onExplore }) => {
  const messages = {
    watching: {
      icon: '📺',
      title: 'Start something. We\'ll track the journey.',
      description: 'Begin watching a show or movie and it will appear here with your progress.',
    },
    planned: {
      icon: '📋',
      title: 'Save shows for the right moment.',
      description: 'Add content to your planned list and organize your watch queue.',
    },
    completed: {
      icon: '🏆',
      title: 'Your wins will live here.',
      description: 'Finished shows and movies will appear here with your completion stats.',
    },
  }

  const message = messages[tab] || messages.watching

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
      <div className="text-5xl sm:text-7xl mb-4 opacity-50 grayscale">{message.icon}</div>
      <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">{message.title}</h3>
      <p className="text-sm sm:text-base text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">{message.description}</p>
      <button
        onClick={onExplore}
        className="px-6 py-3 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg active:scale-95 duration-200"
      >
        Browse Content
      </button>
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

// Stats Component for Completed Tab
const CompletionStats = memo(({ completedItems }) => {
  const totalItems = completedItems.length
  const totalHours = completedItems.reduce((sum, item) => {
    const runtime = item.runtime || item.duration || (item.mediaType === 'movie' ? 120 : 0)
    return sum + (runtime / 60)
  }, 0)
  const topRated = completedItems
    .filter(item => item.rating || item.vote_average)
    .sort((a, b) => (b.rating || b.vote_average) - (a.rating || a.vote_average))
    .slice(0, 3)

  if (totalItems === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex items-center sm:block">
        <div className="p-2 sm:p-0 rounded-full bg-zinc-800 sm:bg-transparent mr-4 sm:mr-0 mb-0 sm:mb-2 shrink-0">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="text-sm text-zinc-400 block mb-0.5 sm:mb-0">Completed</span>
          <p className="text-xl sm:text-2xl font-bold text-white">{totalItems} <span className="text-xs text-zinc-500 font-normal ml-1">items</span></p>
        </div>
      </div>
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex items-center sm:block">
        <div className="p-2 sm:p-0 rounded-full bg-zinc-800 sm:bg-transparent mr-4 sm:mr-0 mb-0 sm:mb-2 shrink-0">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="text-sm text-zinc-400 block mb-0.5 sm:mb-0">Time Watched</span>
          <p className="text-xl sm:text-2xl font-bold text-white">{Math.round(totalHours)} <span className="text-xs text-zinc-500 font-normal ml-1">hours</span></p>
        </div>
      </div>
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex items-center sm:block">
        <div className="p-2 sm:p-0 rounded-full bg-zinc-800 sm:bg-transparent mr-4 sm:mr-0 mb-0 sm:mb-2 shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="text-sm text-zinc-400 block mb-0.5 sm:mb-0">Top Rated</span>
          <p className="text-xl sm:text-2xl font-bold text-white">{topRated.length}</p>
        </div>
      </div>
    </div>
  )
})

CompletionStats.displayName = 'CompletionStats'

const Library = memo(() => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userLists = useSelector((state) => state.userLists.lists)
  const [activeTab, setActiveTab] = useState('watching')
  const [viewMode, setViewMode] = useState('row') // 'row' or 'grid'
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all') // 'all', 'anime', 'manga', 'movie', 'tv'

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true)
      try {
        const response = await listsService.getUserLists()
        const listsData = response?.data || response
        if (listsData) {
          dispatch(setLists(listsData))
        }
      } catch (error) {
        console.error('Error fetching library:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [dispatch])



  // Filter helper
  const filterByMediaType = (items) => {
    if (filterType === 'all') return items
    return items.filter(item => {
      const type = (item.mediaType || item.type || 'movie').toLowerCase()
      if (filterType === 'series' || filterType === 'tv') return type === 'tv'
      return type === filterType
    })
  }

  const watchingItems = useMemo(() => filterByMediaType((userLists.watching || []).map(normalizeMediaItem)), [userLists.watching, filterType])
  const plannedItems = useMemo(() => filterByMediaType((userLists.planned || []).map(normalizeMediaItem)), [userLists.planned, filterType])
  const completedItems = useMemo(() => filterByMediaType((userLists.completed || []).map(normalizeMediaItem)), [userLists.completed, filterType])

  // Group planned items
  const startingSoon = plannedItems.filter(item => {
    const releaseDate = item.releaseDate || item.release_date || item.first_air_date
    if (!releaseDate) return false
    const release = new Date(releaseDate)
    const now = new Date()
    const diffDays = (release - now) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 30
  })

  const savedForLater = plannedItems.filter(item => {
    const releaseDate = item.releaseDate || item.release_date || item.first_air_date
    if (!releaseDate) return true
    const release = new Date(releaseDate)
    const now = new Date()
    const diffDays = (release - now) / (1000 * 60 * 60 * 24)
    return diffDays > 30 || diffDays < 0
  })

  const tabs = [
    { id: 'watching', label: 'Watching', count: watchingItems.length, icon: Play },
    { id: 'planned', label: 'Planned', count: plannedItems.length, icon: Bookmark },
    { id: 'completed', label: 'Completed', count: completedItems.length, icon: CheckCircle2 },
  ]

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'anime', label: 'Anime' },
    { id: 'manga', label: 'Manga' },
    { id: 'manhwa', label: 'Manhwa' },
    { id: 'series', label: 'Series' },
    { id: 'movie', label: 'Movies' },
  ]

  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24 pb-20 font-sans">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
          Your <span className="text-primary">Library</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">Your curated collection. Track your progress, plan your weekends, and celebrate your completions.</p>
      </div>

      {/* Sticky Tabs & Controls */}
      <div className="sticky top-16 sm:top-20 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-3">
            {/* Main Tabs */}
            <div className="flex items-center justify-between overflow-x-auto scrollbar-hide pb-1">
              <div className="flex gap-4 sm:gap-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 pb-2 text-sm sm:text-base font-semibold transition-all whitespace-nowrap border-b-2",
                        activeTab === tab.id
                          ? "text-white border-primary"
                          : "text-zinc-500 border-transparent hover:text-zinc-300"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 transition-colors", activeTab === tab.id ? "text-primary fill-primary/20" : "")} />
                      <span>{tab.label}</span>
                      <span className="text-xs text-zinc-600 font-normal ml-0.5 opacity-80">{tab.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center justify-between gap-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar flex-1 mask-linear-fade">
                <Filter className="w-4 h-4 text-zinc-600 shrink-0 mr-1" />
                {filterOptions.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border",
                      filterType === f.id
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-lg p-1 hover:border-white/20 transition-colors shrink-0">
                <button
                  onClick={() => setViewMode('row')}
                  className={cn(
                    "p-1.5 rounded transition-all",
                    viewMode === 'row'
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                  title="Row View"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded transition-all",
                    viewMode === 'grid'
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                  title="Grid View"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Watching Tab */}
            {activeTab === 'watching' && (
              <>
                {watchingItems.length > 0 ? (
                  viewMode === 'row' ? (
                    <div className="space-y-4">
                      {watchingItems.map((item, index) => (
                        <LibraryRowCard
                          key={item._id || item.id || index}
                          item={item}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                      {watchingItems.map((item, index) => (
                        <MediaCard key={item._id || item.id || index} media={item} />
                      ))}
                    </div>
                  )
                ) : (
                  <EmptyState tab="watching" onExplore={() => navigate('/explore')} />
                )}
              </>
            )}

            {/* Planned Tab */}
            {activeTab === 'planned' && (
              <div className="space-y-8">
                {plannedItems.length > 0 ? (
                  <>
                    {startingSoon.length > 0 && (
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Starting Soon
                        </h2>
                        {viewMode === 'row' ? (
                          <div className="space-y-4">
                            {startingSoon.map((item, index) => (
                              <LibraryRowCard
                                key={item._id || item.id || index}
                                item={item}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                            {startingSoon.map((item, index) => (
                              <MediaCard key={item._id || item.id || index} media={item} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {savedForLater.length > 0 && (
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Saved for Later
                        </h2>
                        {viewMode === 'row' ? (
                          <div className="space-y-4">
                            {savedForLater.map((item, index) => (
                              <LibraryRowCard
                                key={item._id || item.id || index}
                                item={item}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                            {savedForLater.map((item, index) => (
                              <MediaCard key={item._id || item.id || index} media={item} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState tab="planned" onExplore={() => navigate('/explore')} />
                )}
              </div>
            )}

            {/* Completed Tab */}
            {activeTab === 'completed' && (
              <div className="space-y-6">
                {completedItems.length > 0 ? (
                  <>
                    <CompletionStats completedItems={completedItems} />
                    {viewMode === 'row' ? (
                      <div className="space-y-4">
                        {completedItems.map((item, index) => (
                          <div key={item._id || item.id || index} className="relative group">
                            <LibraryRowCard item={item} />
                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/20">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                        {completedItems.map((item, index) => (
                          <div key={item._id || item.id || index} className="relative">
                            <MediaCard media={item} />
                            <div className="absolute top-2 right-2 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-full z-10 border border-primary/20">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState tab="completed" onExplore={() => navigate('/explore')} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
})

Library.displayName = 'Library'

export default Library

