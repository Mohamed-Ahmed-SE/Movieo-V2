import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePageTransition } from '../hooks/useGSAP'
import SkeletonLoader from '../components/common/SkeletonLoader'
import { mediaService } from '../services/mediaService'
import Button from '../components/common/Button'
import { ArrowLeft, Star, Calendar } from 'lucide-react'
import MediaCard from '../components/features/MediaCard'

const PersonPage = () => {
    usePageTransition()
    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [person, setPerson] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const data = await mediaService.getPerson(id)
                setPerson(data)
            } catch (error) {
                console.error('Failed to load person details', error)
                // Set person to null to show "not found" message
                setPerson(null)
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchData()
        }
    }, [id])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-32">
                <SkeletonLoader className="h-96 w-full" />
            </div>
        )
    }

    if (!person) {
        return (
            <div className="container mx-auto px-4 py-32 text-center min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-white mb-4">Person Not Found</h2>
                <Button onClick={() => navigate(-1)} className="mt-8 bg-white text-black hover:bg-white/90">Go Back</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20 pt-20 sm:pt-32">
            <div className="container mx-auto px-4 sm:px-6">
                <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4 sm:mb-6 text-white/50 hover:text-white pl-0 text-xs sm:text-sm">
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Back
                </Button>

                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16">
                    {/* Profile Image - Sticky */}
                    <div className="w-full md:w-80 shrink-0">
                        <div className="bg-zinc-900 overflow-hidden aspect-[2/3] sticky top-24 sm:top-32 border border-white/5">
                            {person.profilePath ? (
                                <img src={person.profilePath} alt={person.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                            )}
                        </div>
                    </div>

                    {/* Info & Bio */}
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">{person.name}</h1>

                        <div className="flex flex-wrap gap-4 sm:gap-6 text-zinc-400 mb-6 sm:mb-8 border-b border-white/5 pb-6 sm:pb-8">
                            {person.birthday && (
                                <div>
                                    <span className="block text-xs uppercase tracking-wider mb-1 text-zinc-500">Born</span>
                                    <span className="text-white">{new Date(person.birthday).toLocaleDateString()}</span>
                                    {person.deathday && <span className="text-zinc-500 text-sm ml-2">(Died: {new Date(person.deathday).getFullYear()})</span>}
                                </div>
                            )}
                            {person.placeOfBirth && (
                                <div>
                                    <span className="block text-xs uppercase tracking-wider mb-1 text-zinc-500">Place of Birth</span>
                                    <span className="text-white">{person.placeOfBirth}</span>
                                </div>
                            )}
                            {person.knownFor && (
                                <div>
                                    <span className="block text-xs uppercase tracking-wider mb-1 text-zinc-500">Known For</span>
                                    <span className="text-white">{person.knownFor}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-8 sm:mb-12">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 sm:h-6 bg-primary rounded-full"></span> Biography
                            </h3>
                            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light whitespace-pre-line">
                                {person.biography || "No biography available."}
                            </p>
                        </div>

                        {/* Known For Grid */}
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                <span className="w-1 h-5 sm:h-6 bg-primary rounded-full"></span> Filmography (Known For)
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {person.credits?.slice(0, 20).map((credit, idx) => {
                                    // Normalize credit to media format for MediaCard
                                    const mediaItem = {
                                        id: credit.id,
                                        mediaId: credit.id,
                                        title: credit.title,
                                        name: credit.title,
                                        poster: credit.poster,
                                        poster_path: credit.poster,
                                        vote_average: credit.voteAverage,
                                        rating: credit.voteAverage,
                                        type: credit.mediaType,
                                        mediaType: credit.mediaType,
                                        releaseDate: credit.year ? `${credit.year}-01-01` : null,
                                        release_date: credit.year ? `${credit.year}-01-01` : null,
                                    }
                                    return (
                                        <MediaCard
                                            key={`${credit.id}-${idx}`}
                                            media={mediaItem}
                                            onCardClick={() => navigate(`/${credit.mediaType}/${credit.id}`)}
                                        />
                                    )
                                })}
                            </div>

                            {person.credits?.length === 0 && (
                                <p className="text-zinc-500 italic">No credits found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PersonPage
