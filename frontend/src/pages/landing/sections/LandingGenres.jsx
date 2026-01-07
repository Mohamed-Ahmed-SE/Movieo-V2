import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Theater, Smile, Ghost, Rocket, Heart, Sword, Sparkles } from 'lucide-react'
import { mediaService } from '../../../services/mediaService'
import MediaCard from '../../../components/features/MediaCard'

const GENRES = [
    { id: 'action', name: 'Action', color: 'from-red-600 to-orange-600', icon: Zap, genreId: 28 },
    { id: 'drama', name: 'Drama', color: 'from-blue-600 to-purple-600', icon: Theater, genreId: 18 },
    { id: 'comedy', name: 'Comedy', color: 'from-yellow-500 to-orange-500', icon: Smile, genreId: 35 },
    { id: 'horror', name: 'Horror', color: 'from-gray-800 to-red-900', icon: Ghost, genreId: 27 },
    { id: 'sci-fi', name: 'Sci-Fi', color: 'from-cyan-600 to-blue-600', icon: Rocket, genreId: 878 },
    { id: 'romance', name: 'Romance', color: 'from-pink-600 to-red-600', icon: Heart, genreId: 10749 },
    { id: 'thriller', name: 'Thriller', color: 'from-gray-700 to-black', icon: Sword, genreId: 53 },
    { id: 'fantasy', name: 'Fantasy', color: 'from-purple-600 to-pink-600', icon: Sparkles, genreId: 14 }
]

const LandingGenres = () => {
    const navigate = useNavigate()
    const sectionRef = useRef(null)
    const [selectedGenre, setSelectedGenre] = useState('action')
    const [genreContent, setGenreContent] = useState({})
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        const fetchGenreContent = async () => {
            if (genreContent[selectedGenre]) return
            
            setLoading(true)
            try {
                const currentGenre = GENRES.find(g => g.id === selectedGenre)
                if (!currentGenre) return
                
                // Fetch genre-specific content using genre ID
                const [movieContent, tvContent] = await Promise.all([
                    mediaService.search('movie', { with_genres: currentGenre.genreId }).catch(() => ({ results: [] })),
                    mediaService.search('tv', { with_genres: currentGenre.genreId }).catch(() => ({ results: [] }))
                ])
                
                // Combine and normalize results
                const allContent = [
                    ...(movieContent?.results || []),
                    ...(tvContent?.results || [])
                ].map(item => ({
                    ...item,
                    id: item.id?.toString(),
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                    title: item.title || item.name,
                    type: item.media_type || 'movie'
                })).filter(item => item.poster && item.backdrop).slice(0, 12)
                
                setGenreContent(prev => ({
                    ...prev,
                    [selectedGenre]: allContent
                }))
            } catch (error) {
                console.error('Failed to fetch genre content:', error)
                // Fallback to trending if genre search fails
                try {
                    const [movieContent, tvContent] = await Promise.all([
                        mediaService.getTrending('movie').catch(() => ({ results: [] })),
                        mediaService.getTrending('tv').catch(() => ({ results: [] }))
                    ])
                    const allContent = [
                        ...(movieContent?.results || []),
                        ...(tvContent?.results || [])
                    ].slice(0, 12)
                    setGenreContent(prev => ({
                        ...prev,
                        [selectedGenre]: allContent
                    }))
                } catch (fallbackError) {
                    console.error('Fallback fetch also failed:', fallbackError)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchGenreContent()
    }, [selectedGenre])

    const handleCardClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        navigate('/register')
    }

    const handleGenreClick = (genreId) => {
        setSelectedGenre(genreId)
    }

    const currentGenre = GENRES.find(g => g.id === selectedGenre)
    const content = genreContent[selectedGenre] || []

    return (
        <section ref={sectionRef} className="w-full py-16 min-h-[400px]">
            <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Explore by Genre</h2>
                <p className="text-zinc-400">Discover content tailored to your taste</p>
            </div>

            {/* Genre Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-12">
                {GENRES.map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => handleGenreClick(genre.id)}
                        className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-200 ${
                            selectedGenre === genre.id
                                ? 'border-red-500 bg-white/10 backdrop-blur-xl scale-105'
                                : 'border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20'
                        }`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-20 ${selectedGenre === genre.id ? 'opacity-30' : ''}`} />
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <genre.icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white ${selectedGenre === genre.id ? 'scale-110' : ''} transition-transform duration-200`} />
                            <h3 className="text-white font-semibold text-xs md:text-sm text-center">
                                {genre.name}
                            </h3>
                        </div>
                    </button>
                ))}
            </div>

            {/* Genre Content Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div>
                    {currentGenre && (
                        <div className="mb-8">
                            <h3 className="text-xl md:text-2xl font-bold text-white">
                                Trending in <span className="text-red-500">{currentGenre.name}</span>
                            </h3>
                        </div>
                    )}
                    {content.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {content.map((item, index) => (
                                <div key={item.id || index}>
                                    <MediaCard
                                        media={item}
                                        onCardClick={handleCardClick}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-400">
                            <p>Loading content for {currentGenre?.name}...</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default LandingGenres
