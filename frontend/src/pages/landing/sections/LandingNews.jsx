import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Calendar, MonitorPlay } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mediaService } from '../../../services/mediaService'

const LandingNews = ({ title, items = [] }) => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)
    const mainNews = items[0]
    const sideNews = items.slice(1, 5)
    const [logo, setLogo] = useState(null)

    useEffect(() => {
        const fetchLogo = async () => {
            if (!mainNews) return
            try {
                const type = mainNews.type === 'manhwa' || mainNews.type === 'manga' ? 'manga' : (mainNews.type || 'movie')
                const images = await mediaService.getImages(type, mainNews.id)
                const foundLogo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0]
                if (foundLogo) {
                    setLogo(`https://image.tmdb.org/t/p/w500${foundLogo.file_path}`)
                }
            } catch (err) {
                // fail silently
            }
        }
        fetchLogo()
    }, [mainNews])

    const handleClick = () => {
        navigate('/register')
    }

    const getImageUrl = useMemo(() => {
        return (item, size = 'original') => {
            if (!item) return null
            if (size === 'original') {
                if (item.backdrop) return item.backdrop
                if (item.backdrop_path) return `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` // Optimized to w1280
                if (item.bannerImage) return item.bannerImage
                if (item.coverImage?.extraLarge) return item.coverImage.extraLarge
                if (item.poster) return item.poster
                if (item.poster_path) return `https://image.tmdb.org/t/p/w780${item.poster_path}`
            } else {
                if (item.backdrop) return item.backdrop
                if (item.backdrop_path) return `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                if (item.poster) return item.poster
                if (item.poster_path) return `https://image.tmdb.org/t/p/w500${item.poster_path}`
                if (item.coverImage?.large) return item.coverImage.large
            }
            return null
        }
    }, [])

    const mainImage = useMemo(() => mainNews ? getImageUrl(mainNews, 'original') : null, [mainNews, getImageUrl])
    const displayTitle = useMemo(() => mainNews?.title || mainNews?.name || '', [mainNews])
    const displayOverview = useMemo(() => mainNews?.overview || mainNews?.description || '', [mainNews])

    // Helper to generate dynamic "news" time
    const getTimeAgo = (item) => {
        if (!item) return 'Just now'
        const dateStr = item.release_date || item.first_air_date
        if (!dateStr) return 'Recently updated'

        const date = new Date(dateStr)
        const now = new Date()
        const diffInMs = now - date
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInDays < 0) return 'Coming Soon' // Future release
        if (diffInHours < 24) return `${diffInHours || 1} hours ago`
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
        return date.toLocaleDateString()
    }

    if (!mainNews) return null

    return (
        <div ref={sectionRef} className="w-full">
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-white">{title}</h2>
                <button
                    onClick={handleClick}
                    className="text-[10px] md:text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                    See More →
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Main Featured News */}
                <div className="group cursor-pointer" onClick={handleClick}>
                    {mainImage && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-3 md:mb-4">
                            <img
                                src={mainImage}
                                alt={displayTitle}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    e.target.onerror = null
                                    e.target.style.display = 'none'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full pointer-events-none">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-3 md:mb-4 group-hover:bg-red-600 transition-colors pointer-events-auto">
                                    <MonitorPlay className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-red-500 font-semibold">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {logo ? (
                            <div className="h-10 md:h-16 w-full flex items-center justify-start">
                                <img src={logo} alt={displayTitle} className="h-full object-contain object-left" />
                            </div>
                        ) : (
                            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                                {displayTitle}
                            </h3>
                        )}
                        {displayOverview && (
                            <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
                                {displayOverview}
                            </p>
                        )}
                    </div>
                </div>

                {/* Side List */}
                <div className="flex flex-col gap-3 md:gap-4">
                    {sideNews.map((news, i) => {
                        const thumbImage = getImageUrl(news, 'w500')
                        if (!thumbImage) return null

                        return (
                            <div
                                key={news.id || i}
                                className="flex gap-3 md:gap-4 group cursor-pointer bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 hover:bg-white/10 transition-colors"
                                onClick={handleClick}
                            >
                                <div className="relative w-24 h-16 md:w-28 md:h-20 shrink-0 rounded-lg overflow-hidden">
                                    <img
                                        src={thumbImage}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        alt={news.title || news.name}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.style.display = 'none'
                                        }}
                                    />
                                </div>
                                <div className="py-0.5 md:py-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-zinc-500 font-semibold mb-0.5 md:mb-1">
                                        <span className="w-1 h-3 bg-red-600 rounded-full" />
                                        <span>News</span>
                                    </div>
                                    <h4 className="text-zinc-200 font-semibold text-xs md:text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
                                        {news.title || news.name} is breaking records globally this week.
                                    </h4>
                                    <p className="text-zinc-500 text-[10px] md:text-xs mt-1">{getTimeAgo(news)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default LandingNews
