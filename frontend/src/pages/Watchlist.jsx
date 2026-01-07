import { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '../hooks/useGSAP'
import { listsService } from '../services/listsService'
import { useSelector, useDispatch } from 'react-redux'
import { setLists } from '../store/slices/userListsSlice'
import MediaCard from '../components/features/MediaCard'
import { Search, X } from 'lucide-react'
import { getMediaImage } from '../utils/mediaHelpers'

const LIST_TYPES = [
  { id: 'watching', label: 'Watching', count: 0 },
  { id: 'completed', label: 'Completed', count: 0 },
  { id: 'planned', label: 'Planned', count: 0 },
  { id: 'dropped', label: 'Dropped', count: 0 },
  { id: 'onHold', label: 'On Hold', count: 0 },
]

const MEDIA_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'TV Shows' },
  { id: 'anime', label: 'Anime' },
  { id: 'manga', label: 'Manga' },
  { id: 'manhwa', label: 'Manhwa' },
]

const Watchlist = memo(() => {
  usePageTransition()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userLists = useSelector((state) => state.userLists.lists)
  const [selectedListType, setSelectedListType] = useState('watching')
  const [selectedMediaType, setSelectedMediaType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

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
        console.error('Error fetching watchlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [dispatch])

  // Calculate counts for each list type
  const listCounts = LIST_TYPES.map(listType => ({
    ...listType,
    count: userLists[listType.id]?.length || 0
  }))

  // Filter items based on selected filters
  const filteredItems = (userLists[selectedListType] || [])
    .filter(item => {
      // Media type filter
      if (selectedMediaType !== 'all' && item.mediaType !== selectedMediaType) {
        return false
      }
      // Search filter
      if (searchQuery) {
        const title = item.title || item.name || ''
        return title.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
    .map(item => {
      // Ensure poster is displayed - prioritize posterUrl, then try various sources
      const poster = item.posterUrl || 
                     item.poster || 
                     item.poster_path || 
                     (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null) ||
                     item.coverImage?.large || 
                     item.coverImage ||
                     getMediaImage(item, 'poster')
      return {
        ...item,
        poster: poster,
        poster_path: poster,
        posterUrl: poster, // Ensure posterUrl is set
        title: item.title || item.name,
        name: item.name || item.title,
      }
    })

  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            My <span className="text-primary">Watchlist</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">Manage your movies, shows, and anime</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Sidebar - Responsive */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile: Horizontal Scrollable Filters */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {listCounts.map((listType) => (
                  <button
                    key={listType.id}
                    onClick={() => setSelectedListType(listType.id)}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      selectedListType === listType.id
                        ? 'bg-primary text-white'
                        : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{listType.label}</span>
                    <span className={`ml-2 text-xs ${
                      selectedListType === listType.id ? 'text-white/80' : 'text-zinc-500'
                    }`}>
                      ({listType.count})
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 mt-3 scrollbar-hide">
                {MEDIA_TYPES.map((mediaType) => (
                  <button
                    key={mediaType.id}
                    onClick={() => setSelectedMediaType(mediaType.id)}
                    className={`flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      selectedMediaType === mediaType.id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/10'
                    }`}
                  >
                    {mediaType.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Vertical Sidebar */}
            <div className="hidden lg:block bg-zinc-900/50 border border-white/10 p-3 sm:p-4 space-y-3 sm:space-y-4 rounded-lg">
              {/* List Type Filters */}
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Status
                </h3>
                <div className="space-y-1">
                  {listCounts.map((listType) => (
                    <button
                      key={listType.id}
                      onClick={() => setSelectedListType(listType.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all rounded-lg ${
                        selectedListType === listType.id
                          ? 'bg-primary text-white'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{listType.label}</span>
                        <span className={`text-xs ${
                          selectedListType === listType.id ? 'text-white/80' : 'text-zinc-500'
                        }`}>
                          {listType.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Type Filters */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Type
                </h3>
                <div className="space-y-1">
                  {MEDIA_TYPES.map((mediaType) => (
                    <button
                      key={mediaType.id}
                      onClick={() => setSelectedMediaType(mediaType.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all rounded-lg ${
                        selectedMediaType === mediaType.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {mediaType.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search your watchlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-zinc-900/50 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content Grid - Responsive */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-zinc-900/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                  {filteredItems.map((item, index) => (
                    <MediaCard key={item._id || item.id || index} media={item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
                <p className="text-zinc-400 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : `Your ${selectedListType} list is empty`}
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-6 py-3 bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                >
                  Browse Content
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
})

Watchlist.displayName = 'Watchlist'

export default Watchlist
