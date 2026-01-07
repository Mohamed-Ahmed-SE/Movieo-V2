import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mediaService } from '../../../services/mediaService'
import MediaCard from '../../../components/features/MediaCard'

const DECADES = [
    { id: '2020s', name: '2020s', start: 2020, end: 2029 },
    { id: '2010s', name: '2010s', start: 2010, end: 2019 },
    { id: '2000s', name: '2000s', start: 2000, end: 2009 },
    { id: '1990s', name: '1990s', start: 1990, end: 1999 },
    { id: '1980s', name: '1980s', start: 1980, end: 1989 },
    { id: '1970s', name: '1970s', start: 1970, end: 1979 },
    { id: '1960s', name: '1960s', start: 1960, end: 1969 },
    { id: '1950s', name: '1950s', start: 1950, end: 1959 }
]

const LandingTimeline = () => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)
    const [decadeContent, setDecadeContent] = useState({})
    const [selectedDecade, setSelectedDecade] = useState('2020s')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDecadeContent = async () => {
            try {
                setLoading(true)
                // Fetch different content sources for variety
                const [movieContent, tvContent] = await Promise.all([
                    mediaService.getTrending('movie').catch(() => []),
                    mediaService.getTrending('tv').catch(() => [])
                ])
                
                const allContent = [
                    ...(Array.isArray(movieContent) ? movieContent : (movieContent?.results || [])),
                    ...(Array.isArray(tvContent) ? tvContent : (tvContent?.results || []))
                ]
                
                // Group content by decade
                const grouped = {}
                DECADES.forEach((decade, index) => {
                    const decadeItems = allContent.filter(item => {
                        const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || item.startDate?.year || null
                        if (!year) return false
                        const yearNum = parseInt(year)
                        return yearNum >= decade.start && yearNum <= decade.end
                    })
                    
                    // If not enough items for this decade, use different slice of all content
                    if (decadeItems.length < 6) {
                        const startIndex = index * 6
                        const fallbackItems = [...allContent].sort(() => Math.random() - 0.5).slice(startIndex, startIndex + 6)
                        grouped[decade.id] = [...decadeItems, ...fallbackItems].slice(0, 6)
                    } else {
                        grouped[decade.id] = decadeItems.slice(0, 6)
                    }
                })
                
                setDecadeContent(grouped)
            } catch (error) {
                console.error('Failed to fetch decade content:', error)
                setDecadeContent({})
            } finally {
                setLoading(false)
            }
        }

        fetchDecadeContent()
    }, [])

    const handleCardClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        navigate('/register')
    }

    const handleDecadeClick = (decadeId) => {
        setSelectedDecade(decadeId)
        const decadeElement = sectionRef.current?.querySelector(`[data-decade="${decadeId}"]`)
        if (decadeElement) {
            decadeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <section ref={sectionRef} className="w-full py-16 min-h-[600px]">
            <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Cinema Evolution</h2>
                <p className="text-zinc-400">Journey through decades of cinematic excellence</p>
            </div>

            {/* Decade Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {DECADES.map((decade) => (
                    <button
                        key={decade.id}
                        onClick={() => handleDecadeClick(decade.id)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            selectedDecade === decade.id
                                ? 'bg-red-600 text-white'
                                : 'bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-300 hover:bg-white/10'
                        }`}
                    >
                        {decade.name}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative max-w-5xl mx-auto">
                {/* Vertical Timeline Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 to-transparent transform -translate-x-1/2" />

                {/* Decade Cards */}
                <div className="space-y-20">
                    {DECADES.map((decade, index) => {
                        const isLeft = index % 2 === 0
                        const decadeContentItems = decadeContent[decade.id] || []
                        
                        return (
                            <div
                                key={decade.id}
                                data-decade={decade.id}
                                className={`relative flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                                {/* Decade Marker */}
                                <div className={`relative z-10 ${isLeft ? 'order-1' : 'order-2'}`}>
                                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl border-2 border-white/20">
                                        <div className="text-center">
                                            <div className="text-white font-black text-2xl mb-1">{decade.name}</div>
                                            <div className="text-white/80 text-xs">{decade.start}-{decade.end}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className={`flex-1 ${isLeft ? 'order-2' : 'order-1'}`}>
                                    <h3 className="text-xl font-bold text-white mb-6">
                                        Iconic Films of the {decade.name}
                                    </h3>
                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : decadeContentItems.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {decadeContentItems.map((item, i) => (
                                                <div key={item.id || i}>
                                                    <MediaCard
                                                        media={item}
                                                        onCardClick={handleCardClick}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-zinc-500 text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                                            <p className="text-sm">Loading content for {decade.name}...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default LandingTimeline
