import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MediaCard from '../../../components/features/MediaCard'

const LandingGrid = ({ title, items = [] }) => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)

    const handleCardClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        navigate('/register')
    }

    useEffect(() => {
        if (!sectionRef.current || items.length === 0) return

        // Simple fade in on scroll
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
    }, [items])

    if (items.length === 0) return null

    return (
        <div ref={sectionRef} className="py-8 opacity-0">
            {title && (
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                    {title}
                </h2>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {items.map((item, index) => (
                    <div key={item.id || index}>
                        <MediaCard
                            media={item}
                            onCardClick={handleCardClick}
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-12">
                <button 
                    onClick={() => navigate('/register')}
                    className="text-zinc-500 hover:text-red-500 text-xl font-bold transition-colors"
                >
                    ...
                </button>
            </div>
        </div>
    )
}

export default LandingGrid
