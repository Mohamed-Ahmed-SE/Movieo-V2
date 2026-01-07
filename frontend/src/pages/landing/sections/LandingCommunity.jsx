import React, { useEffect, useRef } from 'react'
import { MessagesSquare, ThumbsUp, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LandingCommunity = () => {
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
        <div ref={sectionRef} className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 opacity-0">
            <div 
                onClick={handleClick}
                className="bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors duration-200 rounded-2xl p-8 flex flex-col items-center text-center group cursor-pointer border border-white/10 hover:border-white/20"
            >
                <div className="w-16 h-16 rounded-xl bg-red-600/20 flex items-center justify-center text-red-500 mb-4 border border-red-600/20">
                    <MessagesSquare className="w-8 h-8" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Active Discussions</h3>
                <p className="text-zinc-400 text-sm">Join the debate on the latest plot twists and fan theories.</p>
            </div>

            <div 
                onClick={handleClick}
                className="bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors duration-200 rounded-2xl p-8 flex flex-col items-center text-center group cursor-pointer border border-white/10 hover:border-white/20"
            >
                <div className="w-16 h-16 rounded-xl bg-red-600/20 flex items-center justify-center text-red-500 mb-4 border border-red-600/20">
                    <Users className="w-8 h-8" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Millions of Users</h3>
                <p className="text-zinc-400 text-sm">Connect with a global community of movie lovers.</p>
            </div>

            <div 
                onClick={handleClick}
                className="bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors duration-200 rounded-2xl p-8 flex flex-col items-center text-center group cursor-pointer border border-white/10 hover:border-white/20"
            >
                <div className="w-16 h-16 rounded-xl bg-red-600/20 flex items-center justify-center text-red-500 mb-4 border border-red-600/20">
                    <ThumbsUp className="w-8 h-8" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Curated Lists</h3>
                <p className="text-zinc-400 text-sm">Discover hidden gems through community-created watchlists.</p>
            </div>
        </div>
    )
}

export default LandingCommunity
