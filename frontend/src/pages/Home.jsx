import { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSelector } from 'react-redux'
import { HeroSkeleton, CarouselSkeleton } from '../components/common/SkeletonLoader'
import { useHomeData } from '../hooks/useHomeData'
import HorizontalCarousel from '../components/common/HorizontalCarousel'
import NewsSection from '../components/common/NewsSection'
import HeroSection from '../components/home/HeroSection'
import FeaturedSpotlight from '../components/home/FeaturedSpotlight'
import BentoGrid from '../components/home/BentoGrid'
import TrendingGrid from '../components/home/TrendingGrid'
import { mediaService } from '../services/mediaService'
import { debounce } from '../utils/performance'

gsap.registerPlugin(ScrollTrigger)

const Home = memo(() => {
  const containerRef = useRef(null)
  const contentRef = useRef(null)

  // Redux
  const customizations = useSelector(state => state.customization.customizations)

  // Use custom hook for data fetching
  const {
    heroContent,
    trendingMovies,
    trendingTV,
    trendingAnime,
    popularMovies,
    popularSeries,
    topRatedMovies,
    topRatedSeries,
    loading,
    heroLoading
  } = useHomeData()

  const [activeIndex, setActiveIndex] = useState(0)

  // Trailer State
  const [trailerKey, setTrailerKey] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const trailerTimeoutRef = useRef(null)

  // Memoized active hero
  const activeHero = useMemo(() => heroContent[activeIndex], [heroContent, activeIndex])

  // Remove opacity animation to prevent flash - content shows immediately
  // useGSAP(() => {
  //   if ((loading || !minTimeElapsed) || !containerRef.current) return
  //   // Animation removed to prevent flash
  // }, { scope: containerRef, dependencies: [loading, minTimeElapsed] })

  // Carousel Auto-Rotation
  useEffect(() => {
    if (heroContent.length === 0 || showTrailer) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroContent.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [heroContent.length, showTrailer])

  // Reset trailer when slide changes
  useEffect(() => {
    setShowTrailer(false)
    setTrailerKey(null)
    if (trailerTimeoutRef.current) clearTimeout(trailerTimeoutRef.current)
  }, [activeIndex])

  // Trailer handlers (memoized and debounced)
  const handleHeroHover = useCallback(async () => {
    if (!activeHero || showTrailer) return

    if (trailerTimeoutRef.current) clearTimeout(trailerTimeoutRef.current)

    // Debounced trailer loading
    trailerTimeoutRef.current = setTimeout(async () => {
      try {
        const videos = await mediaService.getVideos(activeHero.id, activeHero.type || 'movie')
        const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos[0]

        if (trailer) {
          setTrailerKey(trailer.key)
          setShowTrailer(true)
        }
      } catch (e) {
        console.error("Failed to fetch trailer", e)
      }
    }, 2000)
  }, [activeHero, showTrailer])

  const handleHeroLeave = useCallback(() => {
    if (trailerTimeoutRef.current) clearTimeout(trailerTimeoutRef.current)
    setShowTrailer(false)
    setTrailerKey(null)
  }, [])

  // Memoized carousel sections - only show if media exists
  const carouselSections = useMemo(() => {
    const sections = [
      { title: "Trending Movies", subtitle: "The hottest movies everyone's watching right now", media: trendingMovies, linkTo: "/explore?tab=movies" },
      { title: "Popular Series", subtitle: "Binge-worthy shows that are trending worldwide", media: trendingTV, linkTo: "/explore?tab=movies" },
      { title: "Top Anime", subtitle: "The best anime series and movies to watch", media: trendingAnime, linkTo: "/explore?tab=anime" },
      { title: "Popular Movies", subtitle: "Blockbuster hits and fan favorites", media: popularMovies, linkTo: "/explore?tab=movies" },
      { title: "Top Rated Movies", subtitle: "Critically acclaimed films with highest ratings", media: topRatedMovies, linkTo: "/explore?tab=movies" },
      { title: "Top Rated Series", subtitle: "Award-winning shows loved by audiences", media: topRatedSeries, linkTo: "/explore?tab=movies" }
    ]
    return sections.filter(section => section.media && section.media.length > 0)
  }, [trendingMovies, trendingTV, trendingAnime, popularMovies, topRatedMovies, topRatedSeries])

  if (loading && heroLoading) {
    return (
      <div className="min-h-screen bg-black pb-20 overflow-hidden">
        <HeroSkeleton />
        <div className="relative z-20 space-y-12 -mt-12 2xl:-mt-60 sm:-mt-4">
          <CarouselSkeleton />
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="pb-20 min-h-screen bg-black opacity-100">
      {/* Hero Section */}
      {heroContent.length > 0 && (
        <HeroSection
          heroContent={heroContent}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          customizations={customizations}
          showTrailer={showTrailer}
          trailerKey={trailerKey}
          onHover={handleHeroHover}
          onLeave={handleHeroLeave}
        />
      )}

      {/* Content Sections - All aligned to same left margin */}
      {!loading && (
        <div
          ref={contentRef}
          className="container--full pl-4 sm:pl-6 lg:pl-16 -mt-12 2xl:-mt-60 sm:-mt-4 relative z-20 space-y-12"
          style={{
            contain: 'layout style paint',
            willChange: 'auto'
          }}
        >
          {/* First 2 carousel sections */}
          {carouselSections.slice(0, 2).map((section, index) => (
            <div
              key={`${section.title}-${index}`}
              className="content-section"
              data-section-index={index}
              style={{ contain: 'layout style' }}
            >
              <HorizontalCarousel
                title={section.title}
                subtitle={section.subtitle}
                media={section.media}
                linkTo={section.linkTo}
                linkLabel="View All"
              />
            </div>
          ))}

          {/* Featured Spotlight - Creative Section 1 */}
          {topRatedMovies && topRatedMovies.length > 0 && (
            <div className="content-section" style={{ contain: 'layout style' }}>
              <FeaturedSpotlight items={topRatedMovies.slice(0, 4)} />
            </div>
          )}

          {/* Bento Grid - Creative Section 2 */}
          {popularSeries && popularSeries.length > 0 && (
            <div className="content-section" style={{ contain: 'layout style' }}>
              <BentoGrid items={popularSeries.slice(0, 6)} />
            </div>
          )}

          {/* Trending Grid - Creative Section 3 */}
          {trendingAnime && trendingAnime.length > 0 && (
            <div className="content-section" style={{ contain: 'layout style' }}>
              <TrendingGrid items={trendingAnime.slice(0, 12)} />
            </div>
          )}

          {/* Remaining carousel sections */}
          {carouselSections.slice(2).map((section, index) => (
            <div
              key={`${section.title}-${index + 2}`}
              className="content-section"
              data-section-index={index + 2}
              style={{ contain: 'layout style' }}
            >
              <HorizontalCarousel
                title={section.title}
                subtitle={section.subtitle}
                media={section.media}
                linkTo={section.linkTo}
                linkLabel="View All"
              />
            </div>
          ))}

          {/* News Section */}
          <div className="content-section" style={{ contain: 'layout style' }}>
            <NewsSection />
          </div>
        </div>
      )}
    </div>
  )
})

Home.displayName = 'Home'

export default Home
