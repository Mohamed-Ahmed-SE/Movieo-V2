import React, { useEffect, useState, useRef } from 'react'
import { Play, Info } from 'lucide-react'
import gsap from 'gsap'
import { mediaService } from '../../../services/mediaService'

const LandingHero = ({ items = [] }) => {
    // EMERGENCY FALLBACK to ensure Hero never disappears
    // IDs updated to REAL TMDB IDs so logo fetching works
    const EMERGENCY_DATA = [
        {
            id: 76600, // Avatar: The Way of Water
            backdrop: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vREc05475qg9.jpg",
            title: "Avatar: The Way of Water",
            overview: "Set more than a decade after the events of the first film, learn the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
            vote_average: 7.7,
            release_date: "2022-12-14",
            original_language: "en",
            type: "movie"
        },
        {
            id: 697843, // Extraction 2
            backdrop: "https://image.tmdb.org/t/p/original/rLb2cs785pePbIKYQz18IvuNPJh.jpg",
            title: "Extraction 2",
            overview: "Tasked with extracting a family who is at the mercy of a Georgian gangster, Tyler Rake infiltrates one of the world's deadliest prisons in order to save them.",
            vote_average: 7.5,
            release_date: "2023-06-09",
            original_language: "en",
            type: "movie"
        }
    ]

    const displayItems = (items && items.length > 0) ? items : EMERGENCY_DATA
    const [currentIndex, setCurrentIndex] = useState(0)
    const [displayIndex, setDisplayIndex] = useState(0) // For background display
    const [logos, setLogos] = useState({})
    const progressRef = useRef(null)
    const tweenRef = useRef(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false) // Track if we're in a card click transition
    const backgroundRef = useRef(null)
    const contentRef = useRef(null)
    const cardRefs = useRef({})
    const animationTimeline = useRef(null)

    // Helper to get logo for an item
    const fetchLogo = async (item) => {
        if (!item || logos[item.id]) return
        try {
            // Use item.type (normalized from backend) instead of media_type (which is undefined)
            // Default to 'movie' only if type is missing entirely
            const type = item.type === 'manhwa' || item.type === 'manga' ? 'manga' : (item.type || 'movie')
            const images = await mediaService.getImages(type, item.id)
            const logo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0]
            if (logo) {
                setLogos(prev => ({ ...prev, [item.id]: `https://image.tmdb.org/t/p/w500${logo.file_path}` }))
            }
        } catch (err) {
            // fail silently, title will show
        }
    }

    // Fetch logos for all items on mount/change
    useEffect(() => {
        displayItems.forEach(item => fetchLogo(item))
    }, [displayItems])

    // Reset to first item when items change (category change)
    useEffect(() => {
        setCurrentIndex(0)
        setDisplayIndex(0)
    }, [displayItems])

    // Animate content in when background changes (for auto-slide)
    useEffect(() => {
        if (contentRef.current && !isAnimating) {
            gsap.fromTo(contentRef.current.children,
                {
                    opacity: 0,
                    y: 20,
                    scale: 0.98
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: 'power2.out',
                    delay: 0.2
                }
            )
        }
    }, [currentIndex])

    // Hide background initially when transitioning, then show it during animation
    useEffect(() => {
        if (backgroundRef.current) {
            if (isTransitioning) {
                // Hide new background initially
                gsap.set(backgroundRef.current, { opacity: 0, scale: 1.1 })
            } else {
                // Show background when not transitioning
                gsap.set(backgroundRef.current, { opacity: 1, scale: 1 })
            }
        }
    }, [displayIndex, isTransitioning])

    // Auto-slide logic
    useEffect(() => {
        if (displayItems.length <= 1) return

        // Kill any existing tween first to prevent ghost timers
        if (tweenRef.current) {
            tweenRef.current.kill()
        }

        // Small delay to ensure the DOM ref is attached after render
        const timer = setTimeout(() => {
            if (progressRef.current) {
                // Reset progress bar to 0
                gsap.set(progressRef.current, { width: '0%' })
                // Start new animation
                tweenRef.current = gsap.fromTo(progressRef.current,
                    { width: '0%' },
                    { width: '100%', duration: 8, ease: 'none', onComplete: handleNext }
                )
            }
        }, 150)

        return () => {
            clearTimeout(timer)
            if (tweenRef.current) tweenRef.current.kill()
        }
    }, [currentIndex, displayItems.length])

    const handleNext = () => {
        // Force update without isAnimating check for auto-slide to ensure it never hangs
        const nextIndex = (currentIndex + 1) % displayItems.length
        setDisplayIndex(nextIndex)
        setCurrentIndex(nextIndex)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 500)
    }

    // Creative GSAP animation when clicking a card
    const handleCardClick = (clickedIndex, cardElement) => {
        if (isAnimating || clickedIndex === currentIndex) return
        
        setIsAnimating(true)
        setIsTransitioning(true)
        
        // Kill any existing animations and progress bar
        if (animationTimeline.current) {
            animationTimeline.current.kill()
        }
        if (tweenRef.current) {
            tweenRef.current.kill()
        }
        
        // Get card position and dimensions
        const cardRect = cardElement.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        // Get the card image from the original card
        const originalCardImage = cardElement.querySelector('img')
        if (!originalCardImage) {
            console.warn('No image found in card element')
            return
        }
        
        // Create a wrapper div for the image clone to ensure proper positioning
        const imageWrapper = document.createElement('div')
        imageWrapper.style.position = 'fixed'
        imageWrapper.style.top = `${cardRect.top}px`
        imageWrapper.style.left = `${cardRect.left}px`
        imageWrapper.style.width = `${cardRect.width}px`
        imageWrapper.style.height = `${cardRect.height}px`
        imageWrapper.style.zIndex = '10000'
        imageWrapper.style.pointerEvents = 'none'
        imageWrapper.style.overflow = 'hidden'
        imageWrapper.style.borderRadius = '0.75rem'
        imageWrapper.style.transform = 'translateZ(0)'
        imageWrapper.style.willChange = 'transform, opacity'
        
        // Create a clone of ONLY the image
        const imageClone = originalCardImage.cloneNode(true)
        imageClone.style.width = '100%'
        imageClone.style.height = '100%'
        imageClone.style.objectFit = 'cover'
        imageClone.style.display = 'block'
        
        imageWrapper.appendChild(imageClone)
        document.body.appendChild(imageWrapper)
        
        // Ensure it's visible
        gsap.set(imageWrapper, { opacity: 1, scale: 1 })
        
        // Don't update display index yet - wait for animation
        // We'll update it during the animation
        
        // Create timeline for smooth animation
        animationTimeline.current = gsap.timeline({
            onComplete: () => {
                // Remove image wrapper (which contains the clone)
                if (imageWrapper.parentNode) {
                    imageWrapper.parentNode.removeChild(imageWrapper)
                }
                
                // Restart progress bar timer
                if (progressRef.current) {
                    gsap.set(progressRef.current, { width: '0%' })
                    tweenRef.current = gsap.fromTo(progressRef.current,
                        { width: '0%' },
                        { width: '100%', duration: 8, ease: 'none', onComplete: handleNext }
                    )
                }
                
                setIsTransitioning(false)
                setTimeout(() => setIsAnimating(false), 200)
            }
        })
        
        // Step 0: Fade out old background first (but keep content visible)
        if (backgroundRef.current) {
            animationTimeline.current.to(backgroundRef.current, {
                opacity: 0,
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.inOut'
            })
        }
        
        // Step 1: Animate image wrapper - scale up and move to center (MUST BE VISIBLE)
        // This is the main animation that should be clearly visible
        animationTimeline.current.to(imageWrapper, {
            scale: viewportWidth / cardRect.width * 1.2,
            x: (viewportWidth / 2) - (cardRect.left + cardRect.width / 2),
            y: (viewportHeight / 2) - (cardRect.top + cardRect.height / 2),
            rotation: 1.5,
            borderRadius: 0,
            duration: 0.8,
            ease: 'expo.out',
            onUpdate: () => {
                // Keep it visible during animation
                gsap.set(imageWrapper, { opacity: 1 })
            }
        }, '-=0.15')
        
        // Step 2: Add subtle blur effect during transition (while animating)
        animationTimeline.current.to(imageClone, {
            filter: 'blur(4px)',
            duration: 0.4,
            ease: 'power2.in'
        }, '-=0.7')
        
        // Step 3: Update display index ONLY when image clone is almost at final position
        // Wait until image clone animation is nearly complete
        animationTimeline.current.call(() => {
            setDisplayIndex(clickedIndex)
            // Hide new background immediately after React updates
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (backgroundRef.current) {
                        gsap.set(backgroundRef.current, { opacity: 0, scale: 1.1 })
                    }
                })
            })
        }, null, '-=0.1') // Update very late in the animation
        
        // Step 4: Remove blur from image clone (make it sharp)
        animationTimeline.current.to(imageClone, {
            filter: 'blur(0px)',
            duration: 0.25,
            ease: 'power2.out'
        }, '-=0.25')
        
        // Step 5: Final scale adjustment for image wrapper (perfect fit)
        animationTimeline.current.to(imageWrapper, {
            scale: viewportWidth / cardRect.width,
            rotation: 0,
            duration: 0.25,
            ease: 'power2.inOut'
        }, '-=0.25')
        
        // Step 6: Fade out image wrapper as new background fades in (smooth handoff)
        animationTimeline.current.to(imageWrapper, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        }, '-=0.15')
        
        // Step 7: Fade in new background (replacing the image clone)
        animationTimeline.current.to(backgroundRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'expo.out'
        }, '-=0.3')
        
        // Step 7: Wait for background to be fully in place, then fade out old content
        // Only fade out old content AFTER new background is ready
        animationTimeline.current.call(() => {
            // Update currentIndex so new content is ready
            setCurrentIndex(clickedIndex)
            // Small delay to ensure React has updated
            requestAnimationFrame(() => {
                // Now fade out old content and fade in new content simultaneously
                if (contentRef.current) {
                    // Fade out old content smoothly
                    gsap.to(contentRef.current.children, {
                        opacity: 0,
                        y: -15,
                        scale: 0.98,
                        duration: 0.3,
                        stagger: 0.02,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            // Fade in new content smoothly
                            gsap.fromTo(contentRef.current.children,
                                {
                                    opacity: 0,
                                    y: 20,
                                    scale: 0.98
                                },
                                {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    duration: 0.4,
                                    stagger: 0.04,
                                    ease: 'expo.out'
                                }
                            )
                        }
                    })
                }
            })
        }, null, '-=0.1')
    }

    if (!displayItems || displayItems.length === 0) return null

    const currentItem = displayItems[currentIndex]
    const displayItem = displayItems[displayIndex] || currentItem
    if (!currentItem || !displayItem) return null // Safety check

    // Use currentItem for content (stays old until animation completes)
    // Use displayItem for background (updates immediately)
    const contentItem = currentItem
    const logoUrl = logos[contentItem.id]

    // Safety check for backdrop (use displayItem for background)
    const backdropUrl = displayItem.backdrop || `https://image.tmdb.org/t/p/original${displayItem.backdrop_path}`

    // Safely format release date (use contentItem for display)
    const releaseYear = contentItem.release_date ? new Date(contentItem.release_date).getFullYear() : '2024'
    const type = contentItem.type === 'tv' ? 'Series' : 'Movie'

    // Calculate slider items (Current + Next 2)
    const getSliderItems = () => {
        const visible = []
        for (let i = 0; i < 3; i++) {
            visible.push(displayItems[(currentIndex + i) % displayItems.length])
        }
        return visible
    }
    const sliderItems = getSliderItems()

    // Add parallax effect on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (backgroundRef.current) {
                const scrolled = window.scrollY
                const parallaxSpeed = 0.5
                gsap.to(backgroundRef.current, {
                    y: scrolled * parallaxSpeed,
                    duration: 0.3,
                    ease: 'power1.out'
                })
            }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[85vh] lg:h-screen overflow-hidden bg-black font-sans group">

            {/* 1. Full Screen Background Photo */}
            <div key={displayItem.id} ref={backgroundRef} className="absolute inset-0">
                <img
                    src={backdropUrl}
                    alt={displayItem.title}
                    className="w-full h-full object-cover opacity-60 md:opacity-70 scale-100 transform origin-center"
                    style={{ 
                        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                        transition: isAnimating ? 'none' : 'transform 10s ease-linear'
                    }}
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = 'https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vREc05475qg9.jpg'; // Fallback image
                    }}
                />
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
            </div>

            {/* 2. Main Details (Before/Overlay) */}
            <div className="absolute inset-0 container mx-auto px-6 md:px-12 flex flex-col justify-center h-full pb-32 md:pb-12 text-left">
                <div ref={contentRef} className="max-w-xl md:max-w-2xl relative z-10 space-y-4 md:space-y-6">

                    {/* Brand */}
                    <div className="flex items-center gap-2 mb-2 opacity-0 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-red-600 text-white font-black text-[10px] md:text-xs px-1 rounded-sm">M</div>
                        <span className="text-white/90 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">FILM</span>
                    </div>

                    {/* Main Title / Logo */}
                    <div className="w-full max-w-[280px] md:max-w-[500px] h-24 md:h-56 flex items-center justify-start opacity-0 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={contentItem.title}
                                className="w-full h-full object-contain object-left drop-shadow-2xl"
                            />
                        ) : (
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-[0.9] uppercase drop-shadow-xl line-clamp-2">
                                {contentItem.title}
                            </h1>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center flex-wrap gap-3 md:gap-4 text-xs md:text-lg font-medium text-zinc-100 opacity-0 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-1 text-green-400 font-bold">
                            <span className="text-[10px] md:text-xs">TOP</span>
                            <span>10</span>
                        </div>
                        <span>{releaseYear}</span>
                        <span className="capitalize">{type}</span>
                        <span className="bg-zinc-800/80 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-[10px] md:text-xs border border-white/20">HD</span>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-300 text-xs md:text-sm lg:text-xl line-clamp-3 leading-relaxed max-w-sm md:max-w-xl opacity-0 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                        {contentItem.overview}
                    </p>
                </div>
            </div>

            {/* 3. Slider with "Mini Cards" (Bottom Right) */}
            <div className="absolute bottom-6 right-4 md:bottom-8 md:right-12 z-20 flex flex-col items-end gap-2 md:gap-3 animate-fadeIn">
                <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mr-1 drop-shadow-md">Up Next</span>

                <div className="flex items-end gap-3 md:gap-6">
                    {sliderItems.map((item, i) => {
                        const isCurrent = i === 0;
                        const realIndex = (currentIndex + i) % displayItems.length
                        const thumbBackdrop = item.backdrop || `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                        const itemLogo = logos[item.id]

                        return (
                            <div
                                key={`${item.id}-${i}`}
                                ref={(el) => {
                                    if (el) cardRefs.current[realIndex] = el
                                }}
                                onClick={(e) => {
                                    if (!isCurrent) {
                                        handleCardClick(realIndex, e.currentTarget)
                                    }
                                }}
                                // Make the Active Card (i=0) the "Featured Card" style requested
                                className={`
                                    relative cursor-pointer transition-all duration-500 ease-out overflow-hidden rounded-lg md:rounded-xl shadow-2xl border border-white/10 bg-zinc-900 group
                                    ${isCurrent
                                        ? 'w-60 h-32 md:w-96 md:h-56 opacity-100 scale-100 z-10'  // Active Mobile vs Desktop
                                        : 'w-24 h-14 md:w-60 md:h-32 opacity-50 hover:opacity-100 hover:scale-105 hidden sm:block' // Next Cards (Hide on really small screens if needed, or keep small)
                                    }
                                    ${!isCurrent && i === 1 ? 'block' : ''} 
                                    ${!isCurrent && i > 1 ? 'hidden md:block' : ''} 
                                `}
                            >
                                {/* Note on visibility above: 
                                    - Active: Always visible.
                                    - Next 1: Visible on all screens (block).
                                    - Next 2: Hidden on mobile (hidden md:block).
                                */}

                                <img
                                    src={thumbBackdrop}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={item.title}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent ${isCurrent ? 'opacity-100' : 'opacity-60'}`} />

                                {/* Mini Card Content (Only visible clearly on Active Card or Hover) */}
                                <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-between">
                                    {/* Brand Tag */}
                                    <div className={`flex items-center gap-1 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <div className="bg-red-600 text-white font-black text-[8px] md:text-[10px] px-1 rounded-[2px]">M</div>
                                        <span className="text-white/90 text-[8px] md:text-[10px] font-bold tracking-wider uppercase">FILM</span>
                                    </div>

                                    <div className="flex items-end justify-between mt-auto">
                                        {/* Logo or Title */}
                                        <div className="w-3/4 md:w-2/3">
                                            {itemLogo ? (
                                                <img src={itemLogo} alt={item.title} className="w-full max-h-8 md:max-h-16 object-contain object-left" />
                                            ) : (
                                                <span className="text-white font-bold text-[10px] md:text-sm leading-tight line-clamp-2 uppercase shadow-sm">{item.title}</span>
                                            )}
                                        </div>

                                        {/* Top 10 Badge (Mini) */}
                                        {isCurrent && (
                                            <div className="bg-red-600 text-white text-[8px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded shadow-lg transform translate-y-1">
                                                #{(realIndex + 1)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Current Item Progress Bar (The Line) - Always visible */}
                                {isCurrent && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-zinc-800/80">
                                        <div ref={progressRef} className="h-full bg-red-600 w-0" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

        </section>
    )
}

export default LandingHero
