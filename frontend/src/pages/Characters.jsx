import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePageTransition } from '../hooks/useGSAP'
import SkeletonLoader from '../components/common/SkeletonLoader'
import { mediaService } from '../services/mediaService'
import Button from '../components/common/Button'
import { ArrowLeft } from 'lucide-react'

const Characters = () => {
  usePageTransition()
  const { type, id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null) // Can be { cast, crew } or [characters]
  const [showDetails, setShowDetails] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const detailsData = await mediaService.getDetails(type, id)
        setShowDetails(detailsData)

        const creditsData = await mediaService.getCharacters(type, id)
        setData(creditsData)
      } catch (error) {
        console.error('Failed to load characters', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader className="h-96 w-full" />
      </div>
    )
  }

  const backdropUrl = showDetails?.backdrop?.startsWith('http')
    ? showDetails.backdrop
    : `https://image.tmdb.org/t/p/original${showDetails?.backdrop}`

  // Normalize data for rendering
  const isMovieOrTv = type === 'movie' || type === 'tv'
  const cast = isMovieOrTv ? data?.cast : data || []
  const crew = isMovieOrTv ? data?.crew : []

  // Helper to render a character card
  const CharacterCard = ({ person }) => (
    <div 
      className="bg-zinc-900/50 p-4 border border-white/5 hover:border-primary/50 hover:bg-zinc-800/80 transition-all hover:scale-[1.02] group cursor-pointer shadow-lg hover:shadow-primary/20"
      onClick={() => navigate(`/person/${person.id}`)}
    >
      <div className="aspect-[3/4] mb-4 overflow-hidden bg-zinc-800 shadow-lg">
        {person.image ? (
          <img
            src={person.image.startsWith('http') ? person.image : `https://image.tmdb.org/t/p/w500${person.image}`}
            alt={person.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900 icon-user">No Image</div>
        )}
      </div>
      <h3 className="text-white font-bold leading-tight mb-1 truncate group-hover:text-primary transition-colors">{person.name}</h3>
      <p className="text-zinc-500 text-sm truncate">{person.character || person.job || person.role}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-32">
      {/* Hero */}
      <div className="relative h-[30vh] min-h-[250px] w-full overflow-hidden mb-12">
        <div className="absolute inset-0">
          {backdropUrl && (
            <img src={backdropUrl} alt="Backdrop" className="w-full h-full object-cover opacity-30 blur-sm" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="absolute inset-0 container mx-auto px-6 flex flex-col justify-end pb-8">
          <Button onClick={() => navigate(-1)} variant="ghost" className="absolute top-8 left-6 text-white/70 hover:text-white hover:bg-white/10 w-fit pl-0">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Show
          </Button>

          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            Cast & Crew
          </h1>
          <p className="text-xl text-zinc-400 font-medium">
            {showDetails?.title || showDetails?.name}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">

        {/* Cast Section */}
        {cast && cast.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="w-1 h-6 sm:h-8 bg-primary rounded-full"></span>
              {isMovieOrTv ? 'Top Cast' : 'Characters'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {cast.map((person, idx) => (
                <CharacterCard key={`${person.id}-${idx}`} person={person} />
              ))}
            </div>
          </section>
        )}

        {/* Crew Section (Movies/TV only usually) */}
        {crew && crew.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="w-1 h-6 sm:h-8 bg-zinc-600 rounded-full"></span>
              Crew
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {crew.slice(0, 20).map((person, idx) => ( // Limit crew display
                <CharacterCard key={`${person.id}-${idx}`} person={person} />
              ))}
            </div>
            {crew.length > 20 && (
              <p className="text-center text-zinc-500 mt-8 italic">and {crew.length - 20} more crew members...</p>
            )}
          </section>
        )}

        {(!cast || cast.length === 0) && (!crew || crew.length === 0) && (
          <div className="text-center py-20 text-zinc-500">
            No info found.
          </div>
        )}

      </div>
    </div>
  )
}

export default Characters


