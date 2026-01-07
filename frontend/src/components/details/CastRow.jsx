import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

const CastRow = memo(({ characters, type, id }) => {
  const navigate = useNavigate()
  const displayCast = characters?.slice(0, 6) || []

  if (displayCast.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-zinc-300">Cast</h3>
        {characters.length > 6 && (
          <button
            onClick={() => navigate(`/${type}/${id}/characters`)}
            className="text-zinc-400 hover:text-white text-xs font-medium transition-colors flex items-center gap-1 group"
          >
            View All
            <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
        {displayCast.map((char, index) => (
          <div 
            key={char.id ? `${char.id}-${index}` : index} 
            className="flex-shrink-0 w-20 sm:w-24 cursor-pointer group"
            onClick={() => navigate(`/person/${char.id}`)}
          >
            <div className="aspect-[3/4] overflow-hidden bg-zinc-800 rounded-lg mb-2 group-hover:scale-105 transition-transform">
              <img 
                src={char.image || char.image?.large || char.profile_path || '/placeholder-person.jpg'} 
                alt={char.name || char.character} 
                className="w-full h-full object-cover" 
                loading="lazy" 
              />
            </div>
            <p className="text-white font-semibold text-[10px] sm:text-xs truncate text-center">{char.name || char.character}</p>
            <p className="text-zinc-500 text-[9px] sm:text-[10px] truncate text-center">{char.character || char.role || ''}</p>
          </div>
        ))}
      </div>
    </section>
  )
})

CastRow.displayName = 'CastRow'

export default CastRow

