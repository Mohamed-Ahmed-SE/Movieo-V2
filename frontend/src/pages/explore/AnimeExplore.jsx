import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import { usePageTransition } from '../../hooks/useGSAP'
import { mediaService } from '../../services/mediaService'
import { useSelector, useDispatch } from 'react-redux'
import { setAllCustomizations } from '../../store/slices/customizationSlice'
import { customizationService } from '../../services/customizationService'
import ExploreLayout from '../../components/explore/ExploreLayout'
import ExploreFilters from '../../components/explore/ExploreFilters'
import ExploreGrid from '../../components/explore/ExploreGrid'
import ExploreHero from '../../components/explore/ExploreHero'
import HorizontalCarousel from '../../components/common/HorizontalCarousel'
import MediaCard from '../../components/features/MediaCard'
import { getMediaImage } from '../../utils/mediaHelpers'
import { Filter } from 'lucide-react'
import '../../styles/explore.css'

const AnimeExplore = memo(() => {
  usePageTransition()
  const [allContent, setAllContent] = useState([])
  const [filteredContent, setFilteredContent] = useState([])
  const [continueWatching, setContinueWatching] = useState([])
  const [trendingContent, setTrendingContent] = useState([])
  const [topRatedContent, setTopRatedContent] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [hotNews, setHotNews] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([])
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()])
  const [ratingRange, setRatingRange] = useState([0, 10])
  const [mediaType, setMediaType] = useState('anime')
  
  // View states
  const [sortBy, setSortBy] = useState('popularity')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // UI states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userLists = useSelector((state) => state.userLists.lists)
  const customizations = useSelector((state) => state.customization.customizations)

  // Anime genres
  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ]

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [trendingAnime, popularAnime, topRated] = await Promise.all([
          mediaService.getTrending('anime').catch(() => []),
          mediaService.getTrending('anime').catch(() => []),
          mediaService.getTrending('anime').catch(() => [])
        ])

        const safeList = (list) => Array.isArray(list) ? list : (list?.results || [])
        const anime = safeList(trendingAnime)
        
        // Filter to only include items with images
        const hasImage = (item) => {
          const backdrop = getMediaImage(item, 'backdrop')
          const poster = getMediaImage(item, 'poster')
          return !!(backdrop || poster || item.backdrop_path || item.poster_path || item.bannerImage || item.coverImage)
        }
        
        const animeWithImages = anime.filter(hasImage)
        
        setAllContent(animeWithImages)
        setTrendingContent(animeWithImages.slice(0, 20))
        setTopRatedContent(safeList(topRated).filter(hasImage).slice(5, 25))
        setNewReleases(animeWithImages.slice(10, 30))

        // Generate hot news from trending content
        const news = animeWithImages.slice(0, 3).map((item, idx) => ({
          id: idx + 1,
          title: `${item.title || item.name} - Latest Updates`,
          description: item.overview || item.description || 'Stay tuned for more updates',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          relatedMedia: item
        }))
        setHotNews(news)

        if (isAuthenticated) {
          try {
            const allItems = [
              ...(userLists?.watching || []),
              ...(userLists?.planned || [])
            ]
            const animeItems = allItems.filter(item => item.mediaType === 'anime')
            setContinueWatching(animeItems.slice(0, 4))

            // Fetch customizations
            const customData = await customizationService.getAllCustomizations()
            dispatch(setAllCustomizations(customData.data || {}))
          } catch (error) {
            console.error('Error fetching continue watching:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching anime data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, userLists, dispatch])

  // Filter and sort content
  const applyFilters = useCallback(() => {
    let filtered = [...allContent]

    // Genre filter - handle multiple formats
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(item => {
        // Normalize genres to array of strings
        let itemGenres = []
        
        if (Array.isArray(item.genres)) {
          itemGenres = item.genres.map(g => {
            if (typeof g === 'string') return g
            if (g && typeof g === 'object' && g.name) return g.name
            return null
          }).filter(Boolean)
        }
        
        // If no genres found, skip this item
        if (itemGenres.length === 0) return false
        
        // Check if any selected genre matches any item genre (case-insensitive)
        return selectedGenres.some(selectedGenre => 
          itemGenres.some(itemGenre => 
            itemGenre && itemGenre.toLowerCase() === selectedGenre.toLowerCase()
          )
        )
      })
    }

    // Year filter
    filtered = filtered.filter(item => {
      const year = item.release_date 
        ? new Date(item.release_date).getFullYear()
        : (item.startDate?.year || null)
      if (!year) return true
      return year >= yearRange[0] && year <= yearRange[1]
    })

    // Rating filter
    filtered = filtered.filter(item => {
      const rating = item.vote_average || item.rating || item.averageScore || 0
      return rating >= ratingRange[0] && rating <= ratingRange[1]
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'rating':
          aVal = a.vote_average || a.rating || a.averageScore || 0
          bVal = b.vote_average || b.rating || b.averageScore || 0
          break
        case 'release_date':
          aVal = new Date(a.release_date || a.startDate || 0).getTime()
          bVal = new Date(b.release_date || b.startDate || 0).getTime()
          break
        case 'title':
          aVal = (a.title || a.name || '').toLowerCase()
          bVal = (b.title || b.name || '').toLowerCase()
          break
        default: // popularity
          aVal = a.popularity || 0
          bVal = b.popularity || 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredContent(filtered)
  }, [allContent, selectedGenres, yearRange, ratingRange, sortBy, sortOrder])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleClearFilters = () => {
    setSelectedGenres([])
    setYearRange([1900, new Date().getFullYear()])
    setRatingRange([0, 10])
  }

  const activeFilters = useMemo(() => {
    const filters = []
    if (selectedGenres.length > 0) {
      filters.push({ type: 'genres', label: 'Genres', value: selectedGenres.join(', ') })
    }
    if (yearRange[0] !== 1900 || yearRange[1] !== new Date().getFullYear()) {
      filters.push({ type: 'year', label: 'Year', value: `${yearRange[0]}-${yearRange[1]}` })
    }
    if (ratingRange[0] !== 0 || ratingRange[1] !== 10) {
      filters.push({ type: 'rating', label: 'Rating', value: `${ratingRange[0]}-${ratingRange[1]}` })
    }
    return filters
  }, [selectedGenres, yearRange, ratingRange])

  const quickFilters = [
    { label: 'Trending', onClick: () => setSortBy('popularity') },
    { label: 'Top Rated', onClick: () => setSortBy('rating') },
    { label: 'New Releases', onClick: () => {
      const currentYear = new Date().getFullYear()
      setYearRange([currentYear - 1, currentYear])
    }}
  ]

  if (loading && allContent.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ExploreLayout>
      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          {!isMobile && (
            <div className="w-64 flex-shrink-0">
              <ExploreFilters
                genres={genres}
                selectedGenres={selectedGenres}
                onGenreToggle={handleGenreToggle}
                yearRange={yearRange}
                onYearRangeChange={setYearRange}
                ratingRange={ratingRange}
                onRatingRangeChange={setRatingRange}
                mediaType={mediaType}
                onMediaTypeChange={setMediaType}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Hero Section with Hot News */}
            {trendingContent.length > 0 && (
              <ExploreHero
                featuredMedia={trendingContent[0]}
                hotNews={hotNews}
              />
            )}

            {/* Recommended For You */}
            {trendingContent.length > 0 && (
              <HorizontalCarousel
                title="Recommended For You"
                subtitle="Based on your preferences"
                media={trendingContent.slice(1, 10)}
                showArrows={true}
              />
            )}

            {/* Trending Anime */}
            {trendingContent.length > 0 && (
              <HorizontalCarousel
                title="Trending Anime"
                subtitle="What's hot right now"
                media={trendingContent}
                showArrows={true}
              />
            )}

            {/* Popular Anime */}
            {newReleases.length > 0 && (
              <HorizontalCarousel
                title="Popular Anime"
                subtitle="Blockbuster hits and fan favorites"
                media={newReleases}
                showArrows={true}
              />
            )}

            {/* Top Rated */}
            {topRatedContent.length > 0 && (
              <HorizontalCarousel
                title="Top Rated Anime"
                subtitle="Highest rated by audiences"
                media={topRatedContent}
                showArrows={true}
              />
            )}

            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <HorizontalCarousel
                title="Continue Watching"
                subtitle="Pick up where you left off"
                media={continueWatching}
                showArrows={true}
              />
            )}

            {/* All Content Grid */}
            {filteredContent.length > 0 && (
              <ExploreGrid items={filteredContent} loading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <button
            onClick={() => {/* Toggle mobile filters */}}
            className="w-full p-4 glass text-white font-semibold flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>
      )}
    </ExploreLayout>
  )
})

AnimeExplore.displayName = 'AnimeExplore'

export default AnimeExplore
