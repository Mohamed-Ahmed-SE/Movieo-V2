import { useState, useEffect, useCallback } from 'react'
import { mediaService } from '../services/mediaService'
import { customizationService } from '../services/customizationService'
import { useDispatch, useSelector } from 'react-redux'
import { setAllCustomizations } from '../store/slices/customizationSlice'

/**
 * Custom hook for fetching and managing home page data
 * Implements progressive loading: hero first, then carousels
 */
export const useHomeData = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  const [heroContent, setHeroContent] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTV, setTrendingTV] = useState([])
  const [trendingAnime, setTrendingAnime] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [popularSeries, setPopularSeries] = useState([])
  const [topRatedMovies, setTopRatedMovies] = useState([])
  const [topRatedSeries, setTopRatedSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroLoading, setHeroLoading] = useState(true)

  const safeList = useCallback((list) => {
    return Array.isArray(list) ? list : (list?.results || [])
  }, [])

  // Load hero content first (priority) - Get all trending content
  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        // Fetch all trending content types
        const [movies, tv, anime, manga] = await Promise.all([
          mediaService.getTrending('movie').catch(() => []),
          mediaService.getTrending('tv').catch(() => []),
          mediaService.getTrending('anime').catch(() => []),
          mediaService.getTrending('manga').catch(() => [])
        ])

        // Combine all trending content and take top items
        const allTrending = [
          ...safeList(movies).slice(0, 2),
          ...safeList(tv).slice(0, 2),
          ...safeList(anime).slice(0, 2),
          ...safeList(manga).slice(0, 1)
        ]

        // Fetch logos for heroes
        const heroesWithLogos = await Promise.allSettled(
          allTrending.map(async (hero) => {
            try {
              const images = await mediaService.getImages(
                hero.type || hero.media_type || 'movie',
                hero.id
              )
              const logos = images.logos || []
              const logo = logos.find(l => l.iso_639_1 === 'en') || logos[0]
              return logo ? { ...hero, logo_path: logo.file_path } : hero
            } catch (e) {
              return hero
            }
          })
        ).then(results => 
          results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
        )

        setHeroContent(heroesWithLogos)
      } catch (error) {
        console.error('Error fetching hero content:', error)
      } finally {
        setHeroLoading(false)
      }
    }

    loadHeroContent()
  }, [safeList])

  // Load carousel data progressively after hero
  useEffect(() => {
    if (heroLoading) return

    const loadCarouselData = async () => {
      setLoading(true)
      try {
        // Load all carousel data in parallel
        const [movies, tv, anime, popularM, popularTv] = await Promise.all([
          mediaService.getTrending('movie').catch(() => []),
          mediaService.getTrending('tv').catch(() => []),
          mediaService.getTrending('anime').catch(() => []),
          mediaService.getTrending('movie').catch(() => []),
          mediaService.getTrending('tv').catch(() => [])
        ])

        setTrendingMovies(safeList(movies).slice(0, 20))
        setTrendingTV(safeList(tv).slice(0, 20))
        setTrendingAnime(safeList(anime).slice(0, 20))
        setPopularMovies(safeList(popularM).slice(12, 24))
        setPopularSeries(safeList(popularTv).slice(12, 24))
        setTopRatedMovies(safeList(movies).slice(6, 20))
        setTopRatedSeries(safeList(tv).slice(6, 20))

        // Load customizations if authenticated
        if (isAuthenticated) {
          try {
            const customData = await customizationService.getAllCustomizations()
            dispatch(setAllCustomizations(customData.data || {}))
          } catch (e) {
            console.error("Failed to load customizations", e)
          }
        }
      } catch (error) {
        console.error('Error fetching carousel content:', error)
      } finally {
        setLoading(false)
      }
    }

    // Small delay to ensure hero is rendered first
    const timer = setTimeout(loadCarouselData, 100)
    return () => clearTimeout(timer)
  }, [heroLoading, isAuthenticated, dispatch, safeList])

  return {
    heroContent,
    trendingMovies,
    trendingTV,
    trendingAnime,
    popularMovies,
    popularSeries,
    topRatedMovies,
    topRatedSeries,
    loading: loading || heroLoading,
    heroLoading
  }
}

