import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mediaService } from '../../services/mediaService'
import { getMediaImage } from '../../utils/mediaHelpers'
import { ArrowLeft } from 'lucide-react'

const PosterColumn = ({ items, direction = 'up', speed = 'normal' }) => {
    // Triple items for safety to ensure enough height coverage
    const displayItems = [...items, ...items, ...items]

    if (items.length === 0) return null

    return (
        <div className="relative h-full overflow-hidden mask-gradient">
            <div
                className={`flex flex-col gap-4 w-full ${direction === 'up' ? 'animate-scroll-up' : 'animate-scroll-down'}`}
                style={{ animationDuration: speed === 'slow' ? '60s' : '45s' }}
            >
                {displayItems.map((item, i) => (
                    <div key={`${item.id}-${i}`} className="w-full relative aspect-[2/3] rounded-lg overflow-hidden shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-300">
                        <img
                            src={getMediaImage(item)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {/* Simple vignette */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
                    </div>
                ))}
            </div>
        </div>
    )
}

const AuthLayout = ({ children, title, subtitle }) => {
    const [posters, setPosters] = useState({ col1: [], col2: [], col3: [] })

    useEffect(() => {
        const fetchPosters = async () => {
            try {
                const results = await mediaService.getTrending('movie')
                if (Array.isArray(results) && results.length > 0) {
                    // Add some more random items or shuffle for variety if needed, 
                    // but splitting trending list is fine.

                    // Distribute round-robin
                    const col1 = []
                    const col2 = []
                    const col3 = []

                    results.forEach((item, i) => {
                        if (i % 3 === 0) col1.push(item)
                        else if (i % 3 === 1) col2.push(item)
                        else col3.push(item)
                    })

                    setPosters({ col1, col2, col3 })
                }
            } catch (e) {
                console.error("Failed to fetch posters for auth layout", e)
            }
        }
        fetchPosters()
    }, [])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 lg:p-8 font-rajdhani relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-6xl h-auto min-h-[600px] max-h-[85vh] bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex relative z-10 flex-col lg:flex-row">
                {/* Left Form Section */}
                <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 relative z-20 bg-black lg:border-r border-white/5">
                    {/* Back Button */}
                    <Link to="/" className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors group z-50">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Back to Home</span>
                            <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>

                    <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700 flex flex-col justify-center h-full">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 w-fit mb-6 lg:mb-8 group">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/40">
                                <span className="text-black font-bold text-xl">M</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider group-hover:text-primary transition-colors">MOVIEO</span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">{title}</h1>
                            <p className="text-zinc-400 font-sans text-sm font-medium">{subtitle}</p>
                        </div>

                        <div className="py-2">
                            {children}
                        </div>
                    </div>

                    <div className="mt-6 text-center lg:text-left text-zinc-700 text-[10px] font-sans">
                        &copy; {new Date().getFullYear()} Movieo • Privacy Policy
                    </div>
                </div>

                {/* Right Poster Section */}
                <div className="hidden lg:flex flex-1 relative bg-zinc-950 overflow-hidden items-center justify-center">
                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/40 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />

                    {/* Poster Grid */}
                    <div className="grid grid-cols-3 gap-4 w-[140%] h-[150%] -rotate-6 scale-105 opacity-60 contrast-125 grayscale-[0.2]">
                        {/* Column 1 - Up */}
                        <div className="mt-20">
                            <PosterColumn items={posters.col1} direction="up" speed="slow" />
                        </div>

                        {/* Column 2 - Down */}
                        <div className="-mt-20">
                            <PosterColumn items={posters.col2} direction="down" />
                        </div>

                        {/* Column 3 - Up */}
                        <div className="mt-20">
                            <PosterColumn items={posters.col3} direction="up" speed="slow" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
