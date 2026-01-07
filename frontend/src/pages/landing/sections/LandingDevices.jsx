import React, { useEffect, useRef } from 'react'
import { Smartphone, Monitor, Tablet, Laptop, Tv } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LandingDevices = () => {
    const sectionRef = useRef(null)

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
        <div ref={sectionRef} className="w-full py-16 text-center opacity-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Watch Everywhere</h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-12 text-sm">
                Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV without paying more.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
                <div className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Smartphone className="w-7 h-7 text-zinc-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-zinc-300 text-sm font-medium">Mobile</span>
                </div>
                <div className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Tablet className="w-7 h-7 text-zinc-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-zinc-300 text-sm font-medium">Tablet</span>
                </div>
                <div className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Laptop className="w-7 h-7 text-zinc-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-zinc-300 text-sm font-medium">Laptop</span>
                </div>
                <div className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Monitor className="w-7 h-7 text-zinc-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-zinc-300 text-sm font-medium">Desktop</span>
                </div>
                <div className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Tv className="w-7 h-7 text-zinc-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-zinc-300 text-sm font-medium">Smart TV</span>
                </div>
            </div>
        </div>
    )
}

export default LandingDevices
