import { useEffect, useState, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, Zap } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const HeroSection = memo(({ heroContent, activeIndex, setActiveIndex, customizations, showTrailer, trailerKey, onHover, onLeave }) => {
  const heroRef = useRef(null)
  const slideRefs = useRef([])

  // GSAP animations for hero transitions
  useGSAP(() => {
    if (!heroContent.length) return

    const activeSlide = slideRefs.current[activeIndex]
    if (!activeSlide) return

    const tl = gsap.timeline()

    // Animate active slide in
    const img = activeSlide.querySelector('.hero-img')
    const content = heroRef.current?.querySelectorAll('.hero-element')

    // Image: Ken Burns effect - Optimized with GPU acceleration
    if (img) {
      gsap.set(img, { willChange: 'transform, opacity, filter' })
      tl.fromTo(img,
        { scale: 1.15, filter: 'blur(8px)', opacity: 0 },
        { 
          scale: 1, 
          filter: 'blur(0px)', 
          opacity: 1, 
          duration: 0.8, 
          ease: 'expo.out',
          force3D: true
        },
        0
      )
    }

    // Content: Staggered entrance - Optimized
    if (content && content.length > 0) {
      content.forEach(el => gsap.set(el, { willChange: 'transform, opacity' }))
      tl.fromTo(content,
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.08, 
          ease: 'power2.out',
          force3D: true
        },
        0.2
      )
    }

    // Animate indicators - Optimized
    const indicators = heroRef.current?.querySelectorAll('.hero-indicator')
    if (indicators) {
      gsap.to(indicators, {
        scale: (i) => i === activeIndex ? 1.2 : 1,
        opacity: (i) => i === activeIndex ? 1 : 0.3,
        duration: 0.3,
        ease: 'power2.out',
        force3D: true
      })
    }
  }, { scope: heroRef, dependencies: [activeIndex, heroContent] })

  // Parallax effect removed - hero stays fixed when scrolling

  if (!heroContent.length) return null

  return (
    <div 
      ref={heroRef}
      className="relative h-[100vh] w-full overflow-hidden mb-12 group/hero bg-black"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {heroContent.map((hero, index) => {
        const isActive = index === activeIndex
        const heroCust = customizations?.[hero.id]
        const bgImage = heroCust?.customBackground || hero.backdrop || hero.poster

        return (
          <div
            key={hero.id}
            ref={(el) => (slideRefs.current[index] = el)}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image - Hidden when trailer is playing */}
            {!showTrailer && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={bgImage}
                  alt={hero.title || hero.name}
                  className="hero-img w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              </div>
            )}
          </div>
        )
      })}

      {/* Content - Always visible above trailer */}
      {heroContent[activeIndex] && (
        <div className="absolute bottom-0 -translate-y-1/2 left-0 p-6 sm:p-16 w-full max-w-4xl z-[50] flex flex-col items-start gap-4 sm:gap-6 pointer-events-auto">
          {/* Logo or Title */}
          <div className="hero-element">
            {heroContent[activeIndex].logo_path || heroContent[activeIndex].logo ? (
              <img
                src={heroContent[activeIndex].logo_path ? `https://image.tmdb.org/t/p/w500${heroContent[activeIndex].logo_path}` : heroContent[activeIndex].logo}
                alt={heroContent[activeIndex].title || heroContent[activeIndex].name}
                className="h-24 sm:h-32 md:h-40 object-contain max-w-[80vw] sm:max-w-md origin-left"
                loading="lazy"
              />
            ) : (
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                {heroContent[activeIndex].title || heroContent[activeIndex].name}
              </h1>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold tracking-widest uppercase text-zinc-300 hero-element">
            <span className="text-primary"><Zap className="h-3 w-3 inline mr-1" /> Trending</span>
            <span className="w-1 h-1 bg-zinc-500" />
            <span>{new Date(heroContent[activeIndex].releaseDate || heroContent[activeIndex].release_date || heroContent[activeIndex].first_air_date).getFullYear() || 'N/A'}</span>
            <span className="w-1 h-1 bg-zinc-500" />
            <span className="px-2 py-0.5 border border-white/20 text-[10px]">HD</span>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 line-clamp-3 sm:line-clamp-2 max-w-2xl font-sans leading-relaxed drop-shadow-md hero-element">
            {heroContent[activeIndex].overview}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-4 hero-element">
            <Link to={`/${heroContent[activeIndex].type || heroContent[activeIndex].media_type || 'movie'}/${heroContent[activeIndex].id}`}>
              <button className="px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white font-bold text-sm sm:text-lg uppercase tracking-wider hover:bg-primary/90 transition-transform active:scale-95 flex items-center gap-2">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-white" /> Watch Now
              </button>
            </Link>
            <Link to={`/${heroContent[activeIndex].type || heroContent[activeIndex].media_type || 'movie'}/${heroContent[activeIndex].id}`}>
              <button className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 border border-white/10 text-white font-bold text-sm sm:text-lg uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center gap-2">
                <Info className="h-4 w-4 sm:h-5 sm:w-5" /> Details
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* YouTube Trailer Layer - Behind Content */}
      {showTrailer && trailerKey && (
        <div className="absolute inset-0 z-[20] pointer-events-none overflow-hidden bg-black">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]">
            {/* Shadow on video */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_50px_rgba(0,0,0,0.8)] pointer-events-none z-10" />
            <iframe
              className="w-full h-full opacity-100 scale-[1.3] relative z-0"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1&iv_load_policy=3`}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {/* Shadow below video to hide corners */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
          {/* Minimal overlay - just enough to ensure content readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-15" />
        </div>
      )}

      {/* Carousel Indicators - Above Everything */}
      <div className="hidden sm:flex absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-[30]">
        {heroContent.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`hero-indicator w-1 transition-all duration-300 ${
              idx === activeIndex ? 'h-12 bg-primary shadow-[0_0_10px_theme(colors.primary)]' : 'h-2 bg-white/20 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.activeIndex === nextProps.activeIndex &&
    prevProps.showTrailer === nextProps.showTrailer &&
    prevProps.trailerKey === nextProps.trailerKey &&
    prevProps.heroContent?.length === nextProps.heroContent?.length
  )
})

export default HeroSection

