import { useNavigate } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { memo } from 'react'

const TrendingGrid = memo(({ items = [] }) => {
  const navigate = useNavigate()
  
  if (!items || items.length === 0) return null

  const gridItems = items.slice(0, 12)

  const handleClick = (item) => {
    const type = item.type || item.mediaType || 'movie'
    const id = item.id || item.mediaId
    navigate(`/details/${type}/${id}`)
  }

  return (
    <section className="w-full py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Trending Now</h2>
        <p className="text-zinc-400 text-sm sm:text-base">What's hot right now</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {gridItems.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleClick(item)}
            className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url(${item.poster || item.poster_path || item.coverImage?.large || item.backdrop || item.backdrop_path})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-start justify-between">
                {item.vote_average && (
                  <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-xs font-bold">{item.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="w-full">
                <h4 className="text-white font-bold text-sm sm:text-base line-clamp-2 mb-2">
                  {item.title || item.name}
                </h4>
                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold px-3 py-2 rounded-lg transition-all text-xs sm:text-sm">
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Watch</span>
                </button>
              </div>
            </div>

            {/* Default Badge */}
            <div className="absolute top-2 left-2 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
})

TrendingGrid.displayName = 'TrendingGrid'
export default TrendingGrid
