import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, RefreshCw } from 'lucide-react'
import { mediaService } from '../../services/mediaService'
import { cn } from '../../utils/cn'

const NewsSection = () => {
  const [news, setNews] = useState({
    topNews: [],
    latest: []
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const previousMediaRef = useRef(null)

  // Generate news from trending media
  const generateNews = (allMovies, allTV, allAnime) => {
    const topNews = [
      {
        id: 1,
        title: 'New Anime Season 2024: Top 10 Must-Watch Series',
        thumbnail: allAnime[0]?.backdrop || allAnime[0]?.poster || null,
        date: new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        author: 'Movieo Editorial',
        category: 'Anime',
        relatedMedia: allAnime[0] || null,
        timestamp: Date.now()
      },
      {
        id: 2,
        title: 'Breaking: Major Streaming Platform Announces Exclusive Content Deal',
        thumbnail: allMovies[0]?.backdrop || allMovies[0]?.poster || null,
        date: new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        author: 'Movieo Editorial',
        category: 'News',
        relatedMedia: allMovies[0] || null,
        timestamp: Date.now()
      }
    ]

    const latest = [
      {
        id: 3,
        title: 'Top 5 Movies to Watch This Weekend',
        thumbnail: allMovies[1]?.backdrop || allMovies[1]?.poster || null,
        date: new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        author: 'Movieo Editorial',
        relatedMedia: allMovies[1] || null,
        timestamp: Date.now()
      },
      {
        id: 4,
        title: 'Behind the Scenes: Making of the Latest Blockbuster',
        thumbnail: allMovies[2]?.backdrop || allMovies[2]?.poster || null,
        date: new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        author: 'Movieo Editorial',
        relatedMedia: allMovies[2] || null,
        timestamp: Date.now()
      },
      {
        id: 5,
        title: 'TV Series Finale Review: What We Thought',
        thumbnail: allTV[0]?.backdrop || allTV[0]?.poster || null,
        date: new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        author: 'Movieo Editorial',
        relatedMedia: allTV[0] || null,
        timestamp: Date.now()
      },
      {
        id: 6,
        title: 'Manga Adaptation Announced for Popular Anime',
        thumbnail: allAnime[1]?.backdrop || allAnime[1]?.poster || null,
        date: new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        author: 'Movieo Editorial',
        relatedMedia: allAnime[1] || null,
        timestamp: Date.now()
      }
    ]

    return { topNews, latest }
  }

  // Check if media has changed
  const hasMediaChanged = (newMovies, newTV, newAnime) => {
    const prev = previousMediaRef.current
    if (!prev) return true

    const prevTopMovieId = prev.movies[0]?.id
    const prevTopTVId = prev.tv[0]?.id
    const prevTopAnimeId = prev.anime[0]?.id

    const newTopMovieId = newMovies[0]?.id
    const newTopTVId = newTV[0]?.id
    const newTopAnimeId = newAnime[0]?.id

    return (
      prevTopMovieId !== newTopMovieId ||
      prevTopTVId !== newTopTVId ||
      prevTopAnimeId !== newTopAnimeId
    )
  }

  const fetchNewsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [movies, tv, anime] = await Promise.all([
        mediaService.getTrending('movie').catch(() => []),
        mediaService.getTrending('tv').catch(() => []),
        mediaService.getTrending('anime').catch(() => [])
      ])

      const safeList = (list) => Array.isArray(list) ? list : (list?.results || [])
      const allMovies = safeList(movies)
      const allTV = safeList(tv)
      const allAnime = safeList(anime)

      // Check if media has changed
      const hasChanged = hasMediaChanged(allMovies, allTV, allAnime)
      
      if (hasChanged || !previousMediaRef.current) {
        // Update previous media reference
        previousMediaRef.current = {
          movies: allMovies,
          tv: allTV,
          anime: allAnime
        }

        // Generate new news
        const newsData = generateNews(allMovies, allTV, allAnime)
        setNews(newsData)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching news data:', error)
      // Fallback to mock data if API fails
      if (!previousMediaRef.current) {
        setNews({
          topNews: [
            {
              id: 1,
              title: 'New Anime Season 2024: Top 10 Must-Watch Series',
              thumbnail: null,
              date: '2 hours ago',
              author: 'Movieo Editorial',
              category: 'Anime',
              timestamp: Date.now()
            },
            {
              id: 2,
              title: 'Breaking: Major Streaming Platform Announces Exclusive Content Deal',
              thumbnail: null,
              date: '5 hours ago',
              author: 'Movieo Editorial',
              category: 'News',
              timestamp: Date.now()
            }
          ],
          latest: [
            {
              id: 3,
              title: 'Top 5 Movies to Watch This Weekend',
              thumbnail: null,
              date: '1 day ago',
              author: 'Movieo Editorial',
              timestamp: Date.now()
            },
            {
              id: 4,
              title: 'Behind the Scenes: Making of the Latest Blockbuster',
              thumbnail: null,
              date: '1 day ago',
              author: 'Movieo Editorial',
              timestamp: Date.now()
            },
            {
              id: 5,
              title: 'TV Series Finale Review: What We Thought',
              thumbnail: null,
              date: '2 days ago',
              author: 'Movieo Editorial',
              timestamp: Date.now()
            },
            {
              id: 6,
              title: 'Manga Adaptation Announced for Popular Anime',
              thumbnail: null,
              date: '2 days ago',
              author: 'Movieo Editorial',
              timestamp: Date.now()
            }
          ]
        })
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchNewsData()

    // Set up auto-refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      fetchNewsData(true)
    }, 300000) // 5 minutes

    // Cleanup interval on unmount
    return () => {
      clearInterval(refreshInterval)
    }
  }, [fetchNewsData])
  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
              Latest News
            </h2>
            <p className="text-zinc-400 text-sm">Stay updated with the latest entertainment news</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNewsData(true)}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              "bg-white/5 hover:bg-white/10 border border-white/10",
              "text-white hover:text-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Refresh News"
          >
            <RefreshCw className={cn(
              "h-4 w-4 transition-transform",
              isRefreshing && "animate-spin"
            )} />
            <span className="text-sm font-medium hidden sm:inline">Update</span>
          </button>
          {lastUpdate && (
            <span className="text-xs text-zinc-500 hidden md:inline">
              Updated {lastUpdate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          )}
          <Link
            to="/news"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-black font-bold transition-all text-sm"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
        {/* Top News - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {loading ? (
            <div className="h-[250px] sm:h-[300px] bg-zinc-900/50 rounded-xl animate-pulse" />
          ) : (
            news.topNews.map((newsItem) => (
              <Link
                key={newsItem.id}
                to={`/news/${newsItem.id}`}
                className="group block relative h-[250px] sm:h-[300px] overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-white/10 hover:border-primary/50 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {newsItem.thumbnail ? (
                  <img
                    src={newsItem.thumbnail}
                    alt={newsItem.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center" style={{ display: newsItem.thumbnail ? 'none' : 'flex' }}>
                  <div className="text-4xl opacity-50">📰</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    {newsItem.category && (
                      <span className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-full">
                        {newsItem.category}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">{newsItem.date}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {newsItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400">{newsItem.author}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Latest - Right Column (1/3 width, 2 columns) */}
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          {loading ? (
            <>
              <div className="h-[140px] sm:h-[160px] bg-zinc-900/50 rounded-xl animate-pulse" />
              <div className="h-[140px] sm:h-[160px] bg-zinc-900/50 rounded-xl animate-pulse" />
              <div className="h-[140px] sm:h-[160px] bg-zinc-900/50 rounded-xl animate-pulse hidden lg:block" />
              <div className="h-[140px] sm:h-[160px] bg-zinc-900/50 rounded-xl animate-pulse hidden lg:block" />
            </>
          ) : (
            news.latest.map((newsItem) => (
              <Link
                key={newsItem.id}
                to={`/news/${newsItem.id}`}
                className="group block relative h-[140px] sm:h-[160px] overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-white/10 hover:border-primary/50 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {newsItem.thumbnail ? (
                  <img
                    src={newsItem.thumbnail}
                    alt={newsItem.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center" style={{ display: newsItem.thumbnail ? 'none' : 'flex' }}>
                  <div className="text-2xl opacity-50">📰</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {newsItem.title}
                  </h4>
                  <p className="text-xs text-zinc-400">{newsItem.date}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default NewsSection

