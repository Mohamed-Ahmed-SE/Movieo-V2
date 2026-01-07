import React, { useState, useEffect, useRef } from 'react'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { mediaService } from '../../../services/mediaService'

const LandingSpotlight = ({ items = [] }) => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [logos, setLogos] = useState({})

    const handleClick = () => {
        navigate('/register')
    }

    const spotlightItems = Array.isArray(items) ? items : (items ? [items] : [])

    // Helper to get logo for an item
    const fetchLogo = async (item) => {
        if (!item || logos[item.id]) return
        try {
            const type = item.type === 'manhwa' || item.type === 'manga' ? 'manga' : (item.type || 'tv') // Default to 'tv' as spotlight is often TV
            const images = await mediaService.getImages(type, item.id)
            const logo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0]
            if (logo) {
                setLogos(prev => ({ ...prev, [item.id]: `https://image.tmdb.org/t/p/w500${logo.file_path}` }))
            }
        } catch (err) {
            // fail silently
        }
    }

    useEffect(() => {
        spotlightItems.forEach(item => fetchLogo(item))
    }, [spotlightItems])

    useEffect(() => {
        if (!sectionRef.current) return

        // Simple fade in
        ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(sectionRef.current, {
                    opacity: 1,
                    duration: 0.5
                })
            }
        })
    }, [])

    if (spotlightItems.length === 0) return null

    const currentItem = spotlightItems[currentIndex]
    const logoUrl = logos[currentItem.id]

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % spotlightItems.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + spotlightItems.length) % spotlightItems.length)
    }

    const getImageUrl = (item) => {
        if (!item) return null
        if (item.backdrop) return item.backdrop
        if (item.backdrop_path) return `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` // Optimized
        if (item.bannerImage) return item.bannerImage
        if (item.coverImage?.extraLarge) return item.coverImage.extraLarge
        if (item.poster) return item.poster
        if (item.poster_path) return `https://image.tmdb.org/t/p/original${item.poster_path}`
        return null
    }

    const imageUrl = getImageUrl(currentItem)
    const displayTitle = currentItem?.title || currentItem?.name
    const displayOverview = currentItem?.overview || currentItem?.description || ''

    if (!imageUrl) return null

    return (
        <div ref={sectionRef} className="w-full py-8 md:py-12 opacity-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-2xl font-bold text-white uppercase tracking-wide">Top Of The Day</h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevSlide}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                </div>
            </div>

            <div
                className="relative w-full aspect-video md:aspect-[2.5/1] rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-white/5 backdrop-blur-md border border-white/10"
                onClick={handleClick}
            >
                <div key={currentItem.id} className="w-full h-full">
                    <img
                        src={imageUrl}
                        alt={displayTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                        }}
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClick()
                        }}
                        className="w-12 h-12 md:w-20 md:h-20 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:bg-red-600 hover:border-red-600"
                    >
                        <Play className="w-5 h-5 md:w-8 md:h-8 fill-current ml-0.5" />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 pr-4">
                    <span className="bg-red-600 text-white text-[10px] md:text-xs font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded mb-1.5 md:mb-2 inline-block">MUST WATCH</span>
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={displayTitle}
                            className="h-10 md:h-24 object-contain object-left mb-1 md:mb-2 drop-shadow-lg"
                        />
                    ) : (
                        displayTitle && (
                            <h3 className="text-xl md:text-4xl font-black text-white uppercase mb-1 drop-shadow-md">
                                {displayTitle}
                            </h3>
                        )
                    )}
                    {displayOverview && (
                        <p className="hidden md:block text-zinc-200 max-w-xl mt-1 md:mt-2 line-clamp-2 text-xs md:text-sm shadow-black drop-shadow-md">
                            {displayOverview}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LandingSpotlight
