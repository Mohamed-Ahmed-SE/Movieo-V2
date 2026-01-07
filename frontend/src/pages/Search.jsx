import { useState, useEffect, useRef, memo } from 'react'
import { usePageTransition } from '../hooks/useGSAP'
import { MediaGridSkeleton } from '../components/common/SkeletonLoader'
import MediaCard from '../components/features/MediaCard'
import SearchCard from '../components/search/SearchCard'
import SearchBannerSection from '../components/search/SearchBannerSection'
import ExploreGrid from '../components/explore/ExploreGrid'
import { Search as SearchIcon, X, ChevronDown } from 'lucide-react'
import { mediaService } from '../services/mediaService'
import { useDebounce } from '../hooks/useDebounce'
import { getMediaImage } from '../utils/mediaHelpers'

const Search = memo(() => {
  usePageTransition()
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, anime, movie, manga, series
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [trendingItems, setTrendingItems] = useState([])
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const searchInputRef = useRef(null)
  const filterRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch trending content when no query - get all trending items for trending searches
  useEffect(() => {
    const fetchTrending = async () => {
      if (query.trim()) return // Don't fetch if there's a query

      setLoadingTrending(true)
      try {
        const [movies, tv, anime, manga] = await Promise.all([
          mediaService.getTrending('movie').catch(() => []),
          mediaService.getTrending('tv').catch(() => []),
          mediaService.getTrending('anime').catch(() => []),
          mediaService.getTrending('manga').catch(() => [])
        ])

        const safeList = (list) => Array.isArray(list) ? list : (list?.results || [])
        const hasImage = (item) => {
          const backdrop = getMediaImage(item, 'backdrop')
          const poster = getMediaImage(item, 'poster')
          return !!(backdrop || poster || item.backdrop_path || item.poster_path || item.bannerImage || item.coverImage)
        }

        // Combine all trending items and take top 20 for trending searches
        const allTrending = [
          ...safeList(movies).filter(hasImage),
          ...safeList(tv).filter(hasImage),
          ...safeList(anime).filter(hasImage),
          ...safeList(manga).filter(hasImage)
        ].slice(0, 20)

        setTrendingItems(allTrending)
      } catch (error) {
        console.error('Error fetching trending:', error)
      } finally {
        setLoadingTrending(false)
      }
    }

    fetchTrending()
  }, [query])

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery)
    } else {
      setResults([])
      setLoading(false)
    }
  }, [debouncedQuery, filterType])

  // Fuzzy match function - checks if query matches title (case-insensitive, partial match)
  const fuzzyMatch = (text, query) => {
    if (!text || !query) return false
    const normalizedText = text.toLowerCase().trim()
    const normalizedQuery = query.toLowerCase().trim()
    
    // Exact match
    if (normalizedText === normalizedQuery) return true
    
    // Contains match
    if (normalizedText.includes(normalizedQuery)) return true
    
    // Word boundary match (matches if query is at start of any word)
    const words = normalizedText.split(/\s+/)
    if (words.some(word => word.startsWith(normalizedQuery))) return true
    
    // Character sequence match (fuzzy - checks if query chars appear in order)
    let queryIndex = 0
    for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
      if (normalizedText[i] === normalizedQuery[queryIndex]) {
        queryIndex++
      }
    }
    if (queryIndex === normalizedQuery.length) return true
    
    return false
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // Try multiple search variations for better results
      const searchVariations = [
        searchQuery,
        searchQuery.trim(),
        // Add variations if query is short
        ...(searchQuery.length <= 3 ? [] : [searchQuery + '*'])
      ]
      
      // Search with the main query
      let response = await mediaService.search(searchQuery)
      
      // If results are few, try without some words (for longer queries)
      if (response.length < 5 && searchQuery.split(' ').length > 2) {
        const words = searchQuery.split(' ')
        const shorterQuery = words.slice(0, -1).join(' ')
        if (shorterQuery.trim()) {
          try {
            const additionalResults = await mediaService.search(shorterQuery)
            // Merge and deduplicate
            const existingIds = new Set(response.map(r => r.id))
            const newResults = additionalResults.filter(r => !existingIds.has(r.id))
            response = [...response, ...newResults]
          } catch (e) {
            // Ignore errors from additional search
          }
        }
      }

      // Filter by type if not 'all'
      if (filterType !== 'all') {
        const typeMap = {
          'anime': 'anime',
          'movie': 'movie',
          'manga': 'manga',
          'series': 'tv'
        }
        const targetType = typeMap[filterType]
        if (targetType) {
          response = Array.isArray(response) ? response.filter(item => {
            const itemType = item.type || item.media_type || item.mediaType
            // For anime, check if it's TV with Japanese language
            if (targetType === 'anime') {
              return itemType === 'tv' && (item.original_language === 'ja' || item.spoken_languages?.some(lang => lang?.iso_639_1 === 'ja'))
            }
            return itemType === targetType
          }) : []
        }
      }

      // Apply fuzzy matching to prioritize better matches
      const hasImage = (item) => {
        const backdrop = getMediaImage(item, 'backdrop')
        const poster = getMediaImage(item, 'poster')
        return !!(backdrop || poster || item.backdrop_path || item.poster_path || item.bannerImage || item.coverImage)
      }
      
      let filteredResults = Array.isArray(response) ? response.filter(hasImage) : []
      
      // Sort by relevance using fuzzy matching
      filteredResults = filteredResults
        .map(item => {
          const title = (item.title || item.name || '').toLowerCase()
          const queryLower = searchQuery.toLowerCase()
          
          let score = 0
          // Exact match gets highest score
          if (title === queryLower) score = 100
          // Starts with query
          else if (title.startsWith(queryLower)) score = 80
          // Contains query
          else if (title.includes(queryLower)) score = 60
          // Fuzzy match
          else if (fuzzyMatch(item.title || item.name, searchQuery)) score = 40
          else score = 20
          
          return { ...item, _relevanceScore: score }
        })
        .sort((a, b) => b._relevanceScore - a._relevanceScore)
        .map(({ _relevanceScore, ...item }) => item) // Remove score from final results
      
      setResults(filteredResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      handleSearch(query)
    }
  }

  const handleTrendingClick = (item) => {
    const title = item.title || item.name || ''
    setQuery(title)
    setIsActive(true)
    searchInputRef.current?.focus()
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'anime', label: 'Anime' },
    { value: 'movie', label: 'Movies' },
    { value: 'manga', label: 'Manga' },
    { value: 'series', label: 'Series' }
  ]

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsActive(false)
  }

  const handleFocus = () => {
    setIsActive(true)
  }

  const handleBlur = () => {
    // Keep active if there are results or query
    if (!query && results.length === 0) {
      setIsActive(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24 pb-20 w-full">
      <div className="w-full">
        {/* Search Input with Filter - Full width */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Search movies, TV shows, anime, manga..."
                className="w-full bg-zinc-900/80 border border-white/10 text-white text-sm sm:text-base md:text-lg py-3 sm:py-4 pl-11 sm:pl-14 pr-10 sm:pr-12 focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full sm:w-auto min-w-[120px] sm:min-w-[140px] bg-zinc-900/80 border border-white/10 text-white text-sm sm:text-base py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between gap-2 hover:border-primary transition-colors"
              >
                <span>{filterOptions.find(opt => opt.value === filterType)?.label || 'All'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-zinc-900 border border-white/10 z-50 min-w-[140px]">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterType(option.value)
                        setShowFilterDropdown(false)
                        if (query.trim()) {
                          handleSearch(query)
                        }
                      }}
                      className={`w-full text-left px-4 py-2 sm:py-3 text-sm sm:text-base hover:bg-zinc-800 transition-colors ${filterType === option.value ? 'text-primary bg-zinc-800' : 'text-white'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Trending Content - Strict layout matching photo */}
        {!query && !loadingTrending && (
          <div className="space-y-12 px-4 sm:px-6 lg:px-8">

            {/* 1. Today's Top Picks Today */}
            {trendingItems.length > 0 && (
              <SearchBannerSection
                title="Today's Top Picks Today"
                media={trendingItems.slice(0, 3)}
              />
            )}

            {/* 2. Only On Netflix */}
            {trendingItems.length > 3 && (
              <SearchBannerSection
                title="Only On Netflix"
                media={trendingItems.slice(3, 6)}
              />
            )}

            {/* 3. Top Searches in This Month */}
            {trendingItems.length > 6 && (
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-6">
                  Top Searches in This Month
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                  {trendingItems.slice(6, 18).map((item, idx, array) => (
                    <div key={item.id || idx} className="group relative">
                      {/* Huge Number for Top 10 style if desired, keeping it clean for now as per photo */}
                      <MediaCard
                        media={item}
                        usePoster={true} // Force poster
                        isLastCard={idx === array.length - 1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Only On Netflix (Second Row as per photo having multiple banners) */}
            {trendingItems.length > 18 && (
              <SearchBannerSection
                title="Only On Netflix"
                media={trendingItems.slice(18, 21)}
              />
            )}
          </div>
        )}

        {/* Loading Trending */}
        {!query && loadingTrending && (
          <div className="px-4 sm:px-6 lg:px-8">
            <MediaGridSkeleton />
          </div>
        )}

        {/* Search Results - Show when query exists */}
        {query && (
          <div className="px-4 sm:px-6 lg:px-8">
            {loading ? (
              <MediaGridSkeleton />
            ) : results.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                    Search Results for "{query}"
                  </h2>
                  <span className="text-zinc-500 text-sm">{results.length} results</span>
                </div>

                {/* Search Results Grid with MediaCard - Full width */}
                <ExploreGrid items={results} loading={false} />
              </div>
            ) : !loading ? (
              <div className="text-center py-12 sm:py-20">
                <div className="inline-block p-4 bg-zinc-900/50 mb-4">
                  <SearchIcon className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">No results found</h3>
                <p className="text-zinc-500 text-xs sm:text-sm">Try adjusting your search terms or browse trending searches</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
})

Search.displayName = 'Search'

export default Search
