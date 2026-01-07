import React, { useEffect, useRef } from 'react'
import { Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LandingLive = () => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)

    const handleClick = () => {
        navigate('/register')
    }

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

    return (
        <div ref={sectionRef} className="w-full bg-gradient-to-br from-red-900/20 via-black/40 to-black rounded-2xl p-8 md:p-12 relative overflow-hidden border border-white/10 opacity-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                            <Radio className="w-3 h-3" />
                            LIVE
                        </span>
                        <span className="text-zinc-300 text-sm">Happening Now</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Exclusive Premiere Event
                    </h2>
                    <p className="text-zinc-300 text-sm">
                        Join 250k+ viewers watching the premiere with cast commentary and exclusive behind-the-scenes footage.
                    </p>

                    <button 
                        onClick={handleClick}
                        className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
                    >
                        Join Stream
                    </button>
                </div>

                {/* Mock Chat/Video Widget */}
                <div 
                    className="w-full md:w-80 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-4 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={handleClick}
                >
                    <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden relative">
                        <img
                            src="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
                            alt="Livestream"
                            className="w-full h-full object-cover opacity-90"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://image.tmdb.org/t/p/w500/8rpDcsfLJypbO6vREc05475qg9.jpg"
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="h-28 overflow-hidden relative">
                        <div className="space-y-2 text-xs">
                            <div className="flex gap-2"><span className="text-red-500 font-semibold">User123:</span> <span className="text-zinc-300">This is insane!</span></div>
                            <div className="flex gap-2"><span className="text-blue-400 font-semibold">Moviefan:</span> <span className="text-zinc-300">Cant wait for the next scene</span></div>
                            <div className="flex gap-2"><span className="text-yellow-500 font-semibold">CriticX:</span> <span className="text-zinc-300">Cinematography is top notch</span></div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/90 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingLive
