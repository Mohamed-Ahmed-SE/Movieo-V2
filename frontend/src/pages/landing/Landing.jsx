import React, { useEffect, useState } from 'react'
import { mediaService } from '../../services/mediaService'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'

// Sections
import LandingHero from './sections/LandingHero'
import LandingTabs from './sections/LandingTabs'
import LandingGrid from './sections/LandingGrid'
import LandingNews from './sections/LandingNews'
import LandingSpotlight from './sections/LandingSpotlight'
import LandingGenres from './sections/LandingGenres'
import LandingNewsletter from './sections/LandingNewsletter'
import LandingLive from './sections/LandingLive'
import LandingDevices from './sections/LandingDevices'
import LandingCommunity from './sections/LandingCommunity'

import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const Landing = () => {
    const navigate = useNavigate()
    const [trending, setTrending] = useState([])
    const [movies, setMovies] = useState([])
    const [tvShows, setTvShows] = useState([])
    const [anime, setAnime] = useState([])
    const [manga, setManga] = useState([])
    const [activeTab, setActiveTab] = useState('All')
    const [selectedCategory, setSelectedCategory] = useState('all') // all, movie, tv, anime, manga
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Fetch distinct categories to populate different sections/tabs
                const [allRes, movieRes, tvRes, animeRes, mangaRes] = await Promise.all([
                    mediaService.getTrending('all').catch(() => []),
                    mediaService.getTrending('movie'),
                    mediaService.getTrending('tv'),
                    mediaService.getTrending('anime'),
                    mediaService.getTrending('manga')
                ])

                // Helper to filter valid images - Check both 'backdrop' (full) and legacy 'backdrop_path'
                const hasImage = (item) => (item?.backdrop || item?.backdrop_path) && (item?.poster || item?.poster_path);

                const normalizeItem = (item) => {
                    // If already normalized, return as is
                    if (item.poster && item.backdrop) return item

                    // Normalize TMDB format
                    if (item.poster_path || item.backdrop_path) {
                        return {
                            ...item,
                            id: item.id?.toString(),
                            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                            backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                            title: item.title || item.name,
                            type: item.media_type || item.type || 'movie'
                        }
                    }

                    // Normalize AniList format
                    if (item.coverImage || item.poster) {
                        return {
                            ...item,
                            id: item.id?.toString(),
                            poster: item.poster || item.coverImage?.large || item.coverImage?.extraLarge || null,
                            backdrop: item.bannerImage || item.coverImage?.extraLarge || item.poster || null,
                            title: item.title?.english || item.title?.romaji || item.title || item.name,
                            type: item.type?.toLowerCase() || 'anime',
                            overview: item.description || item.overview,
                            vote_average: item.meanScore ? item.meanScore / 10 : item.rating || item.vote_average
                        }
                    }

                    return item
                }

                const processList = (list) => {
                    const results = list?.results || list?.data || list || []
                    const validList = results.filter(hasImage).map(normalizeItem)
                    return validList.length > 0 ? validList : [];
                }

                setTrending(processList(allRes))
                setMovies(processList(movieRes))
                setTvShows(processList(tvRes))
                setAnime(processList(animeRes))
                setManga(processList(mangaRes))

            } catch (error) {
                console.error("Landing data fetch error, keeping fallback data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        // Smooth Scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        })
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add((time) => lenis.raf(time * 1000))
        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove(lenis.raf)
            lenis.destroy()
        }
    }, [])

    useEffect(() => {
        // Header fade-in animation
        const nav = document.querySelector('.landing-nav')
        if (nav) {
            gsap.fromTo(nav,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
            )

            // Scroll-based header blur enhancement
            ScrollTrigger.create({
                trigger: 'main',
                start: 'top -100',
                onEnter: () => {
                    gsap.to(nav, {
                        backdropFilter: 'blur(20px) saturate(180%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        duration: 0.3
                    })
                },
                onLeaveBack: () => {
                    gsap.to(nav, {
                        backdropFilter: 'blur(8px) saturate(100%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        duration: 0.3
                    })
                }
            })
        }
    }, [])

    // Get content based on selected category
    const getCategoryContent = () => {
        switch (selectedCategory) {
            case 'movie':
                return movies
            case 'tv':
                return tvShows
            case 'anime':
                return anime
            case 'manga':
                return manga
            case 'all':
            default:
                return trending
        }
    }

    const categoryContent = getCategoryContent()

    const getTabContent = () => {
        const content = categoryContent
        switch (activeTab) {
            case 'Latest':
                return content.slice(0, 10)
            case 'Coming Soon':
                return content.slice(0, 10)
            case 'Top Rated':
                // Sort by rating
                return [...content].sort((a, b) => {
                    const ratingA = a.vote_average || a.rating || (a.meanScore ? a.meanScore / 10 : 0) || 0
                    const ratingB = b.vote_average || b.rating || (b.meanScore ? b.meanScore / 10 : 0) || 0
                    return ratingB - ratingA
                }).slice(0, 10)
            case 'All':
            default:
                return content.slice(0, 10)
        }
    }

    if (loading) {
        return (
            <div className="w-full bg-[#050505] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading amazing content...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-[#050505] min-h-screen text-white selection:bg-red-600 selection:text-white pb-20">
            {/* Header - Glassmorphic */}
            <nav className="landing-nav fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4 md:py-5 w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-7 w-7 sm:h-9 sm:w-9 bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center rounded-lg sm:rounded-xl transform hover:rotate-12 hover:scale-110 transition-all duration-300 shadow-lg shadow-red-600/30">
                        <span className="text-white font-bold text-sm sm:text-lg">M</span>
                    </div>
                    <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white">Movieo</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Category Selector - Responsive */}
                    <div className="hidden sm:flex items-center gap-1 sm:gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1 relative">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'movie', label: 'Movies' },
                            { value: 'tv', label: 'TV' },
                            { value: 'anime', label: 'Anime' },
                            { value: 'manga', label: 'Manga' }
                        ].map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium transition-all duration-200 relative ${
                                    selectedCategory === cat.value
                                        ? 'bg-red-600 text-white rounded'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                {cat.label}
                                {/* Underline indicator for active category */}
                                {selectedCategory === cat.value && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                    {/* Mobile category selector - simplified */}
                    <div className="sm:hidden">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'movie', label: 'Movies' },
                                { value: 'tv', label: 'TV' },
                                { value: 'anime', label: 'Anime' },
                                { value: 'manga', label: 'Manga' }
                            ].map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <Link
                        to="/login"
                        className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-white/5"
                    >
                        <span className="hidden sm:inline">Log In</span>
                        <span className="sm:hidden">Login</span>
                    </Link>
                    <Link
                        to="/register"
                        className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:scale-105"
                    >
                        <span className="hidden sm:inline">Sign Up</span>
                        <span className="sm:hidden">Sign Up</span>
                    </Link>
                </div>
            </nav>

            <main>
                {/* Hero uses selected category content - key prop resets timer on category change */}
                <LandingHero
                    key={selectedCategory}
                    items={categoryContent
                        .filter(item => {
                            if (selectedCategory === 'all') {
                                return item.type === 'movie' || item.type === 'tv'
                            }
                            const typeMap = {
                                'movie': 'movie',
                                'tv': 'tv',
                                'anime': 'anime',
                                'manga': ['manga', 'manhwa']
                            }
                            const targetType = typeMap[selectedCategory]
                            if (Array.isArray(targetType)) {
                                return targetType.includes(item.type)
                            }
                            return item.type === targetType
                        })
                        .slice(0, 10)
                    }
                />

                <div className="container mx-auto px-4 sm:px-6 md:px-8 space-y-12 sm:space-y-16 md:space-y-24 mt-8 sm:mt-12 md:mt-20">
                    <div>
                        <LandingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        {getTabContent().length > 0 && (
                            <LandingGrid title={`${activeTab} Movies & TV`} items={getTabContent()} />
                        )}
                    </div>

                    {/* Recommended Section - Dynamic based on category, different items */}
                    {categoryContent.length > 0 && (
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-red-500">Recommended</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 text-zinc-400 group"
                                    >
                                        <span className="group-hover:-translate-x-0.5 transition-transform block">←</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 text-zinc-400 group"
                                    >
                                        <span className="group-hover:translate-x-0.5 transition-transform block">→</span>
                                    </button>
                                </div>
                            </div>
                            {/* Use items 10-20 for Recommended (different from tabs) */}
                            <LandingGrid items={categoryContent.slice(10, 20)} />
                        </div>
                    )}

                    {/* News and Spotlight - Dynamic based on category, different items */}
                    <div className="space-y-16">
                        {categoryContent.length > 0 && (
                            <LandingNews title="Top News" items={categoryContent.slice(20, 24)} />
                        )}

                        {categoryContent.length > 0 && (
                            <LandingSpotlight items={categoryContent.slice(24, 32)} />
                        )}
                    </div>

                    {/* New Movie-Related Sections - Always render */}
                    <LandingGenres />

                    {/* Creative Extra Sections */}
                    <LandingLive />
                    <LandingCommunity />
                    <LandingDevices />

                    <LandingNewsletter />
                </div>
            </main>
        </div>
    )
}

export default Landing
