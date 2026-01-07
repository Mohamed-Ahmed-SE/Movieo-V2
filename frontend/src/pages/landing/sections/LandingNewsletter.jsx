import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LandingNewsletter = () => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
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
        <div ref={sectionRef} className="w-full py-16 border-t border-white/10 mt-16 opacity-0">
            <div className="max-w-3xl mx-auto text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Signup For Newsletter</h2>
                <p className="text-zinc-400 text-sm mb-8">
                    Get the latest updates on new releases, exclusive content, and special offers.
                </p>

                <form 
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-center gap-3 justify-center max-w-xl mx-auto bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                    <input
                        type="text"
                        placeholder="Your name"
                        className="w-full bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-500 border border-white/10"
                    />
                    <input
                        type="email"
                        placeholder="Your email"
                        className="w-full bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-500 border border-white/10"
                    />
                    <button 
                        type="submit"
                        className="w-full sm:w-auto bg-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors text-sm"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LandingNewsletter
